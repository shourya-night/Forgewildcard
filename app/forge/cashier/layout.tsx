import { Role } from "@prisma/client";
import { AuthenticatedShell } from "@/components/forge/authenticated-shell";
import { requireRole } from "@/lib/route-guards";

export default async function CashierLayout({ children }: { children: React.ReactNode }) {
  await requireRole([Role.CASHIER, Role.ADMIN]);
  return (
    <AuthenticatedShell title="Cashier Console" homeHref="/forge/cashier" homeLabel="Cashier Home">
      {children}
    </AuthenticatedShell>
  );
}
