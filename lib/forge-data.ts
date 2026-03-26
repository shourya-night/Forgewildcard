import { HealthTag, MealCategory, Prisma, Role } from "@prisma/client";
import { ensureStudentAccountDailySpendCurrent, getCurrentSpentTodayValue } from "@/lib/account-daily-reset";
import { prisma } from "@/lib/prisma";

export async function getActiveMeals() {
  return prisma.mealItem.findMany({ where: { isActive: true }, orderBy: [{ category: "asc" }, { name: "asc" }] });
}

export async function lookupStudentByWildCard(wildCardId: string) {
  return prisma.$transaction(async (tx) => {
    const student = await tx.user.findFirst({
      where: { wildCardId, role: Role.STUDENT },
      include: { studentAccount: true },
    });

    if (!student?.studentAccount) return student;

    student.studentAccount = await ensureStudentAccountDailySpendCurrent(tx, student.studentAccount);
    return student;
  });
}

export async function getCashierHistory(search?: string) {
  return prisma.transaction.findMany({
    where: search
      ? {
          student: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { wildCardId: { contains: search, mode: "insensitive" } },
            ],
          },
        }
      : undefined,
    include: { student: true, items: { include: { mealItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getParentDashboardData(parentId: string) {
  return prisma.$transaction(async (tx) => {
    const links = await tx.parentStudentLink.findMany({ where: { parentId }, include: { student: { include: { studentAccount: true } } } });

    await Promise.all(
      links.map(async (link) => {
        if (link.student.studentAccount) {
          link.student.studentAccount = await ensureStudentAccountDailySpendCurrent(tx, link.student.studentAccount);
        }
      }),
    );

    const studentIds = links.map((link) => link.studentId);
    const transactions = await tx.transaction.findMany({
      where: { studentId: { in: studentIds } },
      include: { items: { include: { mealItem: true } }, student: true },
      orderBy: { createdAt: "desc" },
    });

    const currentMonth = new Date().getMonth();
    const monthlySpend = transactions
      .filter((transaction) => new Date(transaction.createdAt).getMonth() === currentMonth)
      .reduce((sum, transaction) => sum + Number(transaction.totalAmount), 0);

    const walletBalance = links.reduce((sum, link) => sum + Number(link.student.studentAccount?.walletBalance ?? 0), 0);
    const monthlyLimit = links.reduce((sum, link) => sum + Number(link.student.studentAccount?.monthlyLimit ?? 0), 0);
    const dailyLimit = links.reduce((sum, link) => sum + Number(link.student.studentAccount?.dailyLimit ?? 0), 0);
    const spentToday = links.reduce((sum, link) => sum + (link.student.studentAccount ? getCurrentSpentTodayValue(link.student.studentAccount) : 0), 0);

    const itemRows = transactions.flatMap((transaction) => transaction.items);
    const healthyRatio = itemRows.length
      ? (itemRows.filter((item) => item.mealItem.healthTag === HealthTag.HEALTHY).length / itemRows.length) * 100
      : 0;

    const weeklyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    const categoryMap = new Map<MealCategory, number>();
    const healthMap = new Map<HealthTag, number>();
    const topMeals = new Map<string, number>();

    transactions.forEach((transaction) => {
      const dayKey = transaction.createdAt.toLocaleDateString("en-IN", { weekday: "short" });
      const monthKey = transaction.createdAt.toLocaleDateString("en-IN", { month: "short" });
      weeklyMap.set(dayKey, (weeklyMap.get(dayKey) ?? 0) + Number(transaction.totalAmount));
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + Number(transaction.totalAmount));

      transaction.items.forEach((item) => {
        categoryMap.set(item.mealItem.category, (categoryMap.get(item.mealItem.category) ?? 0) + Number(item.subtotal));
        healthMap.set(item.mealItem.healthTag, (healthMap.get(item.mealItem.healthTag) ?? 0) + item.quantity);
        topMeals.set(item.mealItem.name, (topMeals.get(item.mealItem.name) ?? 0) + item.quantity);
      });
    });

    return {
      students: links.map((link) => ({
        studentId: link.student.id,
        name: link.student.name,
        wildCardId: link.student.wildCardId,
        account: link.student.studentAccount
          ? {
              walletBalance: Number(link.student.studentAccount.walletBalance),
              monthlyLimit: Number(link.student.studentAccount.monthlyLimit),
              dailyLimit: link.student.studentAccount.dailyLimit ? Number(link.student.studentAccount.dailyLimit) : null,
              spentToday: getCurrentSpentTodayValue(link.student.studentAccount),
              spentThisMonth: Number(link.student.studentAccount.spentThisMonth),
            }
          : null,
      })),
      stats: {
        walletBalance,
        monthlySpend,
        remainingAllowance: monthlyLimit - monthlySpend,
        healthyRatio,
        dailyLimit,
        spentToday,
      },
      charts: {
        weeklySpend: [...weeklyMap.entries()].map(([name, spend]) => ({ name, spend })),
        monthlySpend: [...monthlyMap.entries()].map(([name, spend]) => ({ name, spend })),
        categoryBreakdown: [...categoryMap.entries()].map(([name, value]) => ({ name, value })),
        healthMix: [...healthMap.entries()].map(([name, value]) => ({ name, value })),
        topMeals: [...topMeals.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6),
      },
      recentTransactions: transactions.slice(0, 8),
    };
  });
}

export async function getParentHistory(parentId: string, search?: string) {
  const links = await prisma.parentStudentLink.findMany({ where: { parentId } });
  const ids = links.map((link) => link.studentId);

  return prisma.transaction.findMany({
    where: {
      studentId: { in: ids },
      student: search
        ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { wildCardId: { contains: search, mode: "insensitive" } }] }
        : undefined,
    },
    include: { student: true, items: { include: { mealItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function updateStudentControls(studentId: string, data: { monthlyLimit: number; dailyLimit?: number | null }) {
  return prisma.studentAccount.update({
    where: { userId: studentId },
    data: {
      monthlyLimit: new Prisma.Decimal(data.monthlyLimit),
      dailyLimit: data.dailyLimit === null || data.dailyLimit === undefined ? null : new Prisma.Decimal(data.dailyLimit),
    },
  });
}
