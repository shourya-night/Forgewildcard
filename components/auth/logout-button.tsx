"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      aria-label="Logout and return to login"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/20 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur transition hover:bg-white/40"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
