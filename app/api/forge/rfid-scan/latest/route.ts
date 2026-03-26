import { getLatestRecentRfidScan, requireCashierSession } from "@/lib/rfid-scans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireCashierSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await getLatestRecentRfidScan();
  return Response.json(event);
}
