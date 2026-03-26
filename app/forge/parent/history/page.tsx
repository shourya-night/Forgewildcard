import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getParentHistory } from "@/lib/forge-data";

export const dynamic = "force-dynamic";

export default async function ParentHistoryPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getServerSession(authOptions);
  const data = await getParentHistory(session!.user.id, searchParams.q);
  return (
    <main>
      <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-bold">Parent Purchase History</h1><Link href="/forge/parent" className="text-sm underline">Back to dashboard</Link></div>
      <form className="mb-4"><input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search by student name or Wild Card ID" className="w-full rounded-xl border border-forge-blue/30 bg-white px-3 py-2 md:max-w-md" /></form>
      <div className="space-y-3">{data.map((tx) => <article key={tx.id} className="rounded-xl border border-white/60 bg-white/90 p-4 shadow-sm"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{tx.student.name}</p><p className="font-semibold">₹{Number(tx.totalAmount)}</p></div><p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString("en-IN")}</p></article>)}</div>
    </main>
  );
}
