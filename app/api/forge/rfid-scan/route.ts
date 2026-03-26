import { createRfidScanEvent, validateDeviceKey, validateRfidPayload } from "@/lib/rfid-scans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const deviceCheck = validateDeviceKey(request.headers.get("x-device-key"));
  if (!deviceCheck.ok) {
    return Response.json({ error: deviceCheck.message }, { status: deviceCheck.status });
  }

  const body = await request.json();
  const parsed = validateRfidPayload(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid RFID scan payload.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const event = await createRfidScanEvent(parsed.data);
  return Response.json(event, { status: 201 });
}
