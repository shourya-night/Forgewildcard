import Link from "next/link";
import { ArrowRight, CreditCard, ShieldCheck, Wallet } from "lucide-react";

const features = [
  { title: "RFID-first workflow", desc: "Fast student identification at checkout", Icon: CreditCard, color: "#77BEF0" },
  { title: "Real-time ordering", desc: "Live meal inventory and cart updates", Icon: ArrowRight, color: "#FFCB61" },
  { title: "Parent visibility", desc: "Track spend and meals from anywhere", Icon: ShieldCheck, color: "#FF894F" },
  { title: "Wallet controls", desc: "Daily and monthly spending caps", Icon: Wallet, color: "#EA5B6F" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-forge-blue/35 via-white to-forge-rose/25 text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="mb-4 inline-flex rounded-full border border-forge-blue/30 bg-white/80 px-4 py-1 text-sm font-semibold">FORGE by Wild Card</p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight">A modern cashless cafeteria system built for schools</h1>
        <p className="mt-4 max-w-2xl text-slate-700">Wild Card powered ordering, spending controls, and family visibility in one production-ready cafeteria platform.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-xl bg-forge-blue px-5 py-3 font-semibold text-slate-900" href="/forge/cashier">Open Cashier Console</Link>
          <Link className="rounded-xl bg-forge-yellow px-5 py-3 font-semibold text-slate-900" href="/forge/parent">Open Parent Dashboard</Link>
          <Link className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold" href="/login">Login</Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-16 md:grid-cols-4">
        {features.map(({ title, desc, Icon, color }) => (
          <article key={title} className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur">
            <Icon className="mb-3" color={color} />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{desc}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
