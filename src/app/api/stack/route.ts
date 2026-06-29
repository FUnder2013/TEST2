import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  peptideId: z.string().min(1),
  status: z.enum(["ACTIVE", "PLANNED", "STOPPED"]).default("PLANNED"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const stackItems = await prisma.stackItem.findMany({
    where: { userId: session.user.id },
    include: { peptide: true, doseLogs: { orderBy: { takenAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ stackItems });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const peptide = await prisma.peptide.findUnique({
    where: { id: parsed.data.peptideId },
  });
  if (!peptide) {
    return NextResponse.json({ error: "Peptide not found." }, { status: 404 });
  }

  const stackItem = await prisma.stackItem.create({
    data: {
      userId: session.user.id,
      peptideId: parsed.data.peptideId,
      status: parsed.data.status,
      startedAt: parsed.data.status === "ACTIVE" ? new Date() : null,
    },
    include: { peptide: true, doseLogs: true },
  });

  return NextResponse.json({ stackItem }, { status: 201 });
}
