import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const roleHomes: Record<Role, string> = {
  ADMIN: "/forge/cashier",
  CASHIER: "/forge/cashier",
  PARENT: "/forge/parent",
  STUDENT: "/login",
};

export async function requireRole(allowedRoles: Role[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) redirect("/login");

  const role = session.user.role;
  if (!allowedRoles.includes(role)) {
    redirect(roleHomes[role] ?? "/login");
  }

  return session;
}
