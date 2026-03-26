import { lookupStudentByWildCard } from "@/lib/forge-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wildCardId = searchParams.get("wildCardId");
  if (!wildCardId) return Response.json({ error: "wildCardId is required" }, { status: 400 });

  const student = await lookupStudentByWildCard(wildCardId);
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  return Response.json(student);
}
