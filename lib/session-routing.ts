import { Role } from "@prisma/client";

export function getDashboardPathForRole(role?: Role | null) {
  if (role === Role.PARENT) return "/forge/parent";
  if (role === Role.CASHIER || role === Role.ADMIN) return "/forge/cashier";
  return "/login";
}
