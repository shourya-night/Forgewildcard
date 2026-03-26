import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ensureStudentAccountDailySpendCurrent } from "@/lib/account-daily-reset";
import { prisma } from "@/lib/prisma";

const parentControlsSchema = z.object({
  studentId: z.string().min(1),
  monthlyLimit: z.number().nonnegative(),
  dailyLimit: z.number().nonnegative().nullable(),
  walletTopUp: z.number().nonnegative().default(0),
});

export async function checkoutStudentOrder(input: { studentId: string; items: { mealItemId: string; quantity: number }[] }) {
  if (!input.items.length) return { ok: false, message: "Cart is empty." };

  return prisma.$transaction(async (tx) => {
    const student = await tx.user.findUnique({ where: { id: input.studentId }, include: { studentAccount: true } });
    if (!student?.studentAccount) return { ok: false, message: "Student account was not found." };

    const account = await ensureStudentAccountDailySpendCurrent(tx, student.studentAccount);
    const meals = await tx.mealItem.findMany({ where: { id: { in: input.items.map((item) => item.mealItemId) }, isActive: true } });
    const itemDetails = input.items.map((item) => {
      const meal = meals.find((candidate) => candidate.id === item.mealItemId);
      if (!meal) throw new Error("Invalid meal selected.");
      return { meal, quantity: item.quantity, subtotal: Number(meal.price) * item.quantity };
    });

    const total = itemDetails.reduce((sum, detail) => sum + detail.subtotal, 0);

    if (Number(account.walletBalance) < total) return { ok: false, message: "Insufficient wallet balance." };
    if (Number(account.spentThisMonth) + total > Number(account.monthlyLimit)) return { ok: false, message: "Monthly spending limit exceeded." };
    if (account.dailyLimit && Number(account.spentToday) + total > Number(account.dailyLimit)) return { ok: false, message: "Daily spending limit exceeded." };

    const transaction = await tx.transaction.create({
      data: {
        studentId: student.id,
        totalAmount: new Prisma.Decimal(total),
        paymentMethod: "WALLET",
      },
    });

    await tx.transactionItem.createMany({
      data: itemDetails.map((detail) => ({
        transactionId: transaction.id,
        mealItemId: detail.meal.id,
        quantity: detail.quantity,
        unitPrice: detail.meal.price,
        subtotal: new Prisma.Decimal(detail.subtotal),
      })),
    });

    await Promise.all(
      itemDetails.map((detail) =>
        tx.mealItem.update({ where: { id: detail.meal.id }, data: { quantityAvailable: { decrement: detail.quantity } } }),
      ),
    );

    await tx.studentAccount.update({
      where: { userId: student.id },
      data: {
        walletBalance: { decrement: new Prisma.Decimal(total) },
        spentThisMonth: { increment: new Prisma.Decimal(total) },
        spentToday: { increment: new Prisma.Decimal(total) },
        dailySpendUpdatedAt: new Date(),
      },
    });

    return { ok: true, message: "Checkout complete.", transactionId: transaction.id };
  });
}

export async function updateParentStudentControls(parentId: string, payload: unknown) {
  const parsed = parentControlsSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, status: 400, message: "Invalid parent controls payload." };
  }

  const { studentId, monthlyLimit, dailyLimit, walletTopUp } = parsed.data;

  return prisma.$transaction(async (tx) => {
    const link = await tx.parentStudentLink.findUnique({
      where: { parentId_studentId: { parentId, studentId } },
      include: { student: { include: { studentAccount: true } } },
    });

    if (!link?.student.studentAccount) {
      return { ok: false as const, status: 403, message: "You are not authorized to update this student account." };
    }

    const normalizedAccount = await ensureStudentAccountDailySpendCurrent(tx, link.student.studentAccount);
    const updated = await tx.studentAccount.update({
      where: { id: normalizedAccount.id },
      data: {
        monthlyLimit: new Prisma.Decimal(monthlyLimit),
        dailyLimit: dailyLimit === null ? null : new Prisma.Decimal(dailyLimit),
        walletBalance: walletTopUp > 0 ? { increment: new Prisma.Decimal(walletTopUp) } : undefined,
      },
    });

    return {
      ok: true as const,
      status: 200,
      message: walletTopUp > 0 ? "Controls updated and wallet topped up." : "Spending controls updated.",
      account: updated,
    };
  });
}
