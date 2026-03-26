"use client";

import { motion } from "framer-motion";

type Props = { title: string };

export function DashboardLoadingShell({ title }: Props) {
  return (
    <div className="space-y-5 py-2">
      <div className="overflow-hidden rounded-3xl border border-forge-blue/20 bg-white/70 p-5 shadow-sm backdrop-blur">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-forge-blue via-forge-yellow to-forge-rose"
            animate={{ x: ["-30%", "250%"] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <motion.div
            key={idx}
            className="h-24 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-sm"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ repeat: Infinity, duration: 1.6, delay: idx * 0.1 }}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <motion.div
            key={idx}
            className="h-72 rounded-3xl bg-white/80 shadow-sm"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ repeat: Infinity, duration: 1.7, delay: idx * 0.08 }}
          />
        ))}
      </div>
    </div>
  );
}
