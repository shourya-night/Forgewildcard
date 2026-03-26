import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const scanPayloadSchema = z.object({
  wildCardId: z.string().trim().min(1).max(64),
  deviceId: z.string().trim().min(1).max(128),
});

const RECENT_SCAN_WINDOW_MS = 5 * 60 * 1000;

export async function requireCashierSession() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (!session?.user?.id || (role !== Role.CASHIER && role !== Role.ADMIN)) {
    return null;
  }

  return session;
}

export function validateRfidPayload(payload: unknown) {
  return scanPayloadSchema.safeParse(payload);
}

export function validateDeviceKey(headerValue: string | null) {
  const expectedKey = process.env.FORGE_RFID_DEVICE_KEY;

  if (!expectedKey) {
    return { ok: false as const, status: 500, message: "FORGE_RFID_DEVICE_KEY is not configured." };
  }

  if (!headerValue || headerValue !== expectedKey) {
    return { ok: false as const, status: 401, message: "Unauthorized RFID device." };
  }

  return { ok: true as const };
}

export async function createRfidScanEvent(data: z.infer<typeof scanPayloadSchema>) {
  return prisma.rfidScanEvent.create({
    data: {
      wildCardId: data.wildCardId,
      deviceId: data.deviceId,
    },
  });
}

export async function getLatestRecentRfidScan() {
  return prisma.rfidScanEvent.findFirst({
    where: {
      createdAt: {
        gte: new Date(Date.now() - RECENT_SCAN_WINDOW_MS),
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
