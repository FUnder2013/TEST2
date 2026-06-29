import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const doseSchema = z.object({
  takenAt: z.string().datetime().or(z.string().min(1)),
  amount: z.number().positive(),
  unit: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const stackItem = await prisma.stackItem.findUnique({ where: { id } });
  if (!stackItem || stackItem.userId !== session.user.id) {
    return NextResponse.json({ error: "Stack item not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = doseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const takenAt = new Date(parsed.data.takenAt);
  if (Number.isNaN(takenAt.getTime())) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  const doseLog = await prisma.doseLog.create({
    data: {
      stackItemId: id,
      takenAt,
      amount: parsed.data.amount,
      unit: parsed.data.unit,
      note: parsed.data.note,
    },
  });

  return NextResponse.json({ doseLog }, { status: 201 });
}
