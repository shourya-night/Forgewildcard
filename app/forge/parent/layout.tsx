import { Role } from "@prisma/client";
import { AuthenticatedShell } from "@/components/forge/authenticated-shell";
import { requireRole } from "@/lib/route-guards";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireRole([Role.PARENT]);
  return (
    <AuthenticatedShell title="Parent Dashboard" homeHref="/forge/parent" homeLabel="Parent Home">
      {children}
    </AuthenticatedShell>
  );
}
