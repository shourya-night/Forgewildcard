import { checkoutStudentOrder } from "@/lib/forge-actions";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await checkoutStudentOrder(body);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
