import Link from "next/link";
import { Wallet } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

export function AuthenticatedShell({
  title,
  homeHref,
  homeLabel,
  children,
}: {
  title: string;
  homeHref: string;
  homeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forge-blue/15 via-white to-forge-rose/15">
      <header className="border-b border-forge-blue/20 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-forge-blue via-forge-yellow to-forge-orange text-slate-900">
              <Wallet size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">FORGE by WILD CARD</p>
              <p className="font-semibold text-slate-900">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={homeHref} className="rounded-xl border border-forge-blue/30 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-forge-blue/10">
              {homeLabel}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">{children}</div>
    </div>
  );
}
