import Link from "next/link";
import { CashierConsole } from "@/components/forge/cashier-console";
import { getActiveMeals } from "@/lib/forge-data";

export const dynamic = "force-dynamic";

export default async function CashierPage() {
  const meals = await getActiveMeals();
  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cashier Console</h1>
        <Link href="/forge/cashier/history" className="rounded-lg bg-gradient-to-r from-forge-blue to-forge-orange px-3 py-2 text-sm font-semibold text-slate-900">View History</Link>
      </div>
      <CashierConsole meals={meals} />
    </main>
  );
}
