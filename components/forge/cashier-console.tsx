"use client";

import { MealItem } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, ScanLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconBadge } from "@/components/forge/icon-badge";

type StudentData = {
  id: string;
  name: string;
  wildCardId: string;
  studentAccount: { walletBalance: string; monthlyLimit: string; dailyLimit: string | null; spentThisMonth: string; spentToday: string };
};

type RfidScanEvent = {
  id: string;
  wildCardId: string;
  deviceId: string;
  createdAt: string;
} | null;

export function CashierConsole({ meals }: { meals: MealItem[] }) {
  const [wildCardId, setWildCardId] = useState("WC-STU-1001");
  const [student, setStudent] = useState<StudentData | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("Waiting for Wild Card scan...");
  const [rfidBanner, setRfidBanner] = useState<{ label: string; tone: "idle" | "detected" | "success" }>({
    label: "Manual entry or RFID scan ready",
    tone: "idle",
  });
  const processedScanIdRef = useRef<string | null>(null);

  const cartItems = useMemo(() => meals.filter((meal) => (cart[meal.id] ?? 0) > 0).map((meal) => ({ meal, quantity: cart[meal.id] })), [cart, meals]);
  const total = cartItems.reduce((sum, item) => sum + Number(item.meal.price) * item.quantity, 0);

  const lookupStudent = useCallback(async (targetWildCardId?: string, source: "manual" | "rfid" = "manual") => {
    const lookupId = (targetWildCardId ?? wildCardId).trim();
    if (!lookupId) {
      setStatus("Enter a Wild Card ID to continue.");
      return;
    }

    setStatus(source === "rfid" ? "RFID scan detected. Loading student..." : "Looking up student...");
    const res = await fetch(`/api/forge/student-lookup?wildCardId=${encodeURIComponent(lookupId)}`);
    if (!res.ok) {
      setStatus("Student not found.");
      setStudent(null);
      setRfidBanner(source === "rfid" ? { label: `RFID scan detected for ${lookupId}, but no student matched`, tone: "detected" } : { label: "Manual lookup ready", tone: "idle" });
      return;
    }

    const data = await res.json();
    setWildCardId(data.wildCardId ?? lookupId);
    setStudent(data);
    setStatus(source === "rfid" ? `Student loaded from RFID: ${data.name}.` : `Ready to order for ${data.name}.`);
    setRfidBanner(source === "rfid" ? { label: `RFID scan detected from ${lookupId} • ${data.name} loaded`, tone: "success" } : { label: "Manual lookup ready", tone: "idle" });
  }, [wildCardId]);

  useEffect(() => {
    const pollLatestScan = async () => {
      const res = await fetch("/api/forge/rfid-scan/latest", { cache: "no-store" });
      if (!res.ok) return;

      const latestScan = (await res.json()) as RfidScanEvent;
      if (!latestScan?.id || processedScanIdRef.current === latestScan.id) {
        return;
      }

      processedScanIdRef.current = latestScan.id;
      setWildCardId(latestScan.wildCardId);
      setRfidBanner({ label: `RFID scan detected from ${latestScan.deviceId}`, tone: "detected" });
      await lookupStudent(latestScan.wildCardId, "rfid");
    };

    void pollLatestScan();
    const intervalId = window.setInterval(() => {
      void pollLatestScan();
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [lookupStudent]);

  const checkout = async () => {
    if (!student) return;
    const res = await fetch("/api/forge/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, items: cartItems.map((item) => ({ mealItemId: item.meal.id, quantity: item.quantity })) }),
    });
    const data = await res.json();
    setStatus(data.message);
    if (res.ok) setCart({});
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
      <aside className="space-y-4 rounded-2xl border border-forge-blue/20 bg-white/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Student Identification</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-forge-blue/10 px-3 py-1 text-xs font-semibold text-slate-700">
            <Radio size={12} className="text-forge-blue" />
            Live RFID ready
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={rfidBanner.label}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={[
              "rounded-xl border px-3 py-2 text-sm",
              rfidBanner.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "",
              rfidBanner.tone === "detected" ? "border-forge-orange/30 bg-forge-orange/10 text-slate-800" : "",
              rfidBanner.tone === "idle" ? "border-forge-blue/20 bg-forge-blue/5 text-slate-700" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <ScanLine size={16} />
              <span>{rfidBanner.label}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <input
          className="w-full rounded-xl border border-forge-blue/20 px-3 py-2"
          value={wildCardId}
          onChange={(e) => setWildCardId(e.target.value)}
          placeholder="Enter Wild Card ID"
        />
        <button onClick={() => void lookupStudent()} className="w-full rounded-xl bg-forge-blue py-2 font-semibold text-slate-900">Lookup Student</button>
        <div className="rounded-xl bg-gradient-to-r from-forge-yellow/30 to-forge-orange/20 p-3 text-sm">{status}</div>
        {student ? <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{student.name}</p><p>Wild Card ID: {student.wildCardId}</p><p>Wallet ₹{student.studentAccount.walletBalance}</p><p>Month limit ₹{student.studentAccount.monthlyLimit}</p><p>Spent today ₹{student.studentAccount.spentToday}</p></div> : null}
      </aside>

      <section className="rounded-2xl border border-forge-blue/20 bg-white/90 p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Meal Catalog</h2>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {meals.map((meal) => (
            <motion.article key={meal.id} whileHover={{ y: -3 }} className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="mb-2 flex items-center justify-between"><IconBadge iconKey={meal.iconKey} /><span className="text-sm font-semibold">₹{Number(meal.price)}</span></div>
              <p className="font-semibold">{meal.name}</p><p className="text-xs text-slate-500">{meal.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => setCart((prev) => ({ ...prev, [meal.id]: Math.max((prev[meal.id] ?? 0) - 1, 0) }))} className="rounded-md bg-slate-100 px-2">-</button>
                <span>{cart[meal.id] ?? 0}</span>
                <button onClick={() => setCart((prev) => ({ ...prev, [meal.id]: (prev[meal.id] ?? 0) + 1 }))} className="rounded-md bg-forge-yellow px-2">+</button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <aside className="sticky top-4 h-fit space-y-3 rounded-2xl border border-forge-rose/20 bg-white/95 p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="max-h-[50vh] space-y-2 overflow-auto">
          {cartItems.map((item) => (
            <div key={item.meal.id} className="flex justify-between text-sm"><span>{item.meal.name} × {item.quantity}</span><span>₹{Number(item.meal.price) * item.quantity}</span></div>
          ))}
        </div>
        <div className="border-t pt-3 font-semibold">Total: ₹{total}</div>
        <button onClick={checkout} disabled={!student || !cartItems.length} className="w-full rounded-xl bg-forge-rose py-2 font-semibold text-white disabled:opacity-60">Checkout</button>
      </aside>
    </div>
  );
}
