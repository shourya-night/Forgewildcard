import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { updateParentStudentControls } from "@/lib/forge-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== Role.PARENT) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await updateParentStudentControls(session.user.id, body);

  return Response.json(
    result.ok ? { message: result.message, account: result.account } : { error: result.message },
    { status: result.status },
  );
}
