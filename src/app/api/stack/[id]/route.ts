import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "PLANNED", "STOPPED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.stackItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Stack item not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const stackItem = await prisma.stackItem.update({
    where: { id },
    data: {
      status: parsed.data.status,
      startedAt:
        parsed.data.status === "ACTIVE" && !existing.startedAt
          ? new Date()
          : existing.startedAt,
      stoppedAt: parsed.data.status === "STOPPED" ? new Date() : null,
    },
    include: { peptide: true, doseLogs: true },
  });

  return NextResponse.json({ stackItem });
}
