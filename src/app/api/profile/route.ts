import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOAL_VALUES = [
  "FAT_LOSS",
  "MUSCLE_GAIN",
  "LONGEVITY",
  "RECOVERY",
  "SKIN_HAIR",
  "COGNITIVE",
  "LIBIDO",
  "SLEEP",
  "INJURY_REPAIR",
  "GENERAL_WELLNESS",
] as const;

const profileSchema = z.object({
  goals: z.array(z.enum(GOAL_VALUES)).min(1),
  weightKg: z.number().positive().max(500),
  heightCm: z.number().positive().max(300),
  age: z.number().int().positive().max(120),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
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

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { ...data, userId: session.user.id },
  });

  return NextResponse.json({ profile }, { status: 200 });
}
