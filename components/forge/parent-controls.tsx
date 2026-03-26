"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ControlStudent = {
  studentId: string;
  name: string;
  wildCardId: string | null;
  account: {
    walletBalance: number;
    monthlyLimit: number;
    dailyLimit: number | null;
    spentToday: number;
    spentThisMonth: number;
  } | null;
};

export function ParentControls({ students }: { students: ControlStudent[] }) {
  const router = useRouter();
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { tone: "success" | "error"; message: string } | undefined>>({});
  const [formState, setFormState] = useState<Record<string, { monthlyLimit: string; dailyLimit: string; walletTopUp: string }>>(
    Object.fromEntries(
      students.map((student) => [
        student.studentId,
        {
          monthlyLimit: student.account ? String(student.account.monthlyLimit) : "0",
          dailyLimit: student.account?.dailyLimit != null ? String(student.account.dailyLimit) : "",
          walletTopUp: "",
        },
      ]),
    ),
  );

  const updateField = (studentId: string, field: "monthlyLimit" | "dailyLimit" | "walletTopUp", value: string) => {
    setFormState((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        [field]: value,
      },
    }));
  };

  const saveControls = async (studentId: string) => {
    const current = formState[studentId];
    setSavingStudentId(studentId);
    setFeedback((existing) => ({ ...existing, [studentId]: undefined }));

    const res = await fetch("/api/forge/parent-controls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        monthlyLimit: Number(current.monthlyLimit || 0),
        dailyLimit: current.dailyLimit === "" ? null : Number(current.dailyLimit),
        walletTopUp: Number(current.walletTopUp || 0),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setFeedback((existing) => ({ ...existing, [studentId]: { tone: "error", message: data.error ?? "Unable to update controls." } }));
      setSavingStudentId(null);
      return;
    }

    setFeedback((existing) => ({ ...existing, [studentId]: { tone: "success", message: data.message ?? "Controls updated." } }));
    setFormState((currentState) => ({
      ...currentState,
      [studentId]: {
        ...currentState[studentId],
        walletTopUp: "",
      },
    }));
    router.refresh();
    setSavingStudentId(null);
  };

  return (
    <section className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-900">Parent Controls</h2>
        <p className="text-sm text-slate-600">Update monthly and daily limits, or add funds to the linked student wallet.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {students.map((student) => {
          const account = student.account;
          const currentForm = formState[student.studentId];
          const currentFeedback = feedback[student.studentId];

          return (
            <article key={student.studentId} className="rounded-2xl border border-forge-blue/20 bg-gradient-to-br from-white to-forge-blue/5 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{student.name}</h3>
                  <p className="text-xs text-slate-500">Wild Card ID: {student.wildCardId ?? "Not assigned"}</p>
                </div>
                <div className="rounded-xl bg-forge-yellow/20 px-3 py-2 text-right text-xs font-medium text-slate-700">
                  <p>Wallet ₹{account?.walletBalance.toFixed(0) ?? "0"}</p>
                  <p>Spent today ₹{account?.spentToday.toFixed(0) ?? "0"}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Monthly limit
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentForm.monthlyLimit}
                    onChange={(event) => updateField(student.studentId, "monthlyLimit", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-forge-blue/20 bg-white px-3 py-2"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Daily limit
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentForm.dailyLimit}
                    onChange={(event) => updateField(student.studentId, "dailyLimit", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-forge-blue/20 bg-white px-3 py-2"
                    placeholder="Optional"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 md:col-span-2">
                  Wallet top-up
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentForm.walletTopUp}
                    onChange={(event) => updateField(student.studentId, "walletTopUp", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-forge-blue/20 bg-white px-3 py-2"
                    placeholder="Add funds to wallet"
                  />
                </label>
              </div>

              {currentFeedback ? (
                <p className={`mt-3 text-sm ${currentFeedback.tone === "success" ? "text-emerald-700" : "text-rose-600"}`}>
                  {currentFeedback.message}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void saveControls(student.studentId)}
                disabled={savingStudentId === student.studentId}
                className="mt-4 rounded-xl bg-gradient-to-r from-forge-blue to-forge-orange px-4 py-2 font-semibold text-slate-900 disabled:opacity-60"
              >
                {savingStudentId === student.studentId ? "Saving..." : "Apply changes"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
