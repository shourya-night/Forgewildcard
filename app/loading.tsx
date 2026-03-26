"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-forge-blue/25 via-white to-forge-rose/20">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/80 px-8 py-7 shadow-lg backdrop-blur">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="rounded-full bg-gradient-to-br from-forge-blue via-forge-yellow to-forge-orange p-4 text-slate-900"
        >
          <UtensilsCrossed size={24} />
        </motion.div>
        <div className="text-center" aria-live="polite">
          <p className="font-semibold text-slate-900">Preparing FORGE</p>
          <motion.p
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="text-sm text-slate-600"
          >
            Syncing wallet, meals, and dashboard data...
          </motion.p>
        </div>
      </div>
    </div>
  );
}
