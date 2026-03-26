import { getServerSession } from "next-auth";
import Link from "next/link";
import { ParentDashboard } from "@/components/forge/parent-dashboard";
import { authOptions } from "@/lib/auth";
import { getParentDashboardData } from "@/lib/forge-data";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const session = await getServerSession(authOptions);
  const data = await getParentDashboardData(session!.user.id);

  return (
    <main>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Parent Dashboard</h1>
        <Link href="/forge/parent/history" className="rounded-lg bg-gradient-to-r from-forge-yellow to-forge-rose px-3 py-2 text-sm font-semibold text-slate-900">Purchase History</Link>
      </div>
      <ParentDashboard data={data} />
    </main>
  );
}
