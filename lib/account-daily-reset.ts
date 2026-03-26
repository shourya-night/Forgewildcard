import type { Prisma, PrismaClient, StudentAccount } from "@prisma/client";

const SCHOOL_TIME_ZONE = "Asia/Kolkata";

function getSchoolDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function needsDailyReset(account: Pick<StudentAccount, "dailySpendUpdatedAt" | "spentToday">) {
  if (!account.dailySpendUpdatedAt) return Number(account.spentToday) > 0;
  return getSchoolDayKey(account.dailySpendUpdatedAt) !== getSchoolDayKey(new Date());
}

export async function ensureStudentAccountDailySpendCurrent<TClient extends PrismaClient | Prisma.TransactionClient>(
  client: TClient,
  account: StudentAccount,
) {
  if (!needsDailyReset(account)) {
    return account;
  }

  return client.studentAccount.update({
    where: { id: account.id },
    data: {
      spentToday: 0,
      dailySpendUpdatedAt: new Date(),
    },
  });
}

export function getCurrentSpentTodayValue(account: Pick<StudentAccount, "dailySpendUpdatedAt" | "spentToday">) {
  return needsDailyReset(account) ? 0 : Number(account.spentToday);
}
