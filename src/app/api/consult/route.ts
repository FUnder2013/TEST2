import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  peptideId: z.string().min(1),
  reason: z.string().min(1).max(2000),
  history: z.string().max(2000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const consultRequests = await prisma.consultRequest.findMany({
    where: { userId: session.user.id },
    include: { peptide: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ consultRequests });
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

  const peptide = await prisma.peptide.findUnique({ where: { id: parsed.data.peptideId } });
  if (!peptide) {
    return NextResponse.json({ error: "Peptide not found." }, { status: 404 });
  }
  if (!peptide.isRx) {
    return NextResponse.json(
      { error: "This peptide does not require a provider consult." },
      { status: 400 },
    );
  }

  const consultRequest = await prisma.consultRequest.create({
    data: {
      userId: session.user.id,
      peptideId: peptide.id,
      reason: parsed.data.reason,
      history: parsed.data.history,
    },
    include: { peptide: true },
  });

  return NextResponse.json({ consultRequest }, { status: 201 });
}
