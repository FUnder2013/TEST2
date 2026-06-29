import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const userId = session.user.id;

  await prisma.$transaction([
    prisma.foodLog.deleteMany({ where: { userId } }),
    prisma.weightLog.deleteMany({ where: { userId } }),
    prisma.sleepLog.deleteMany({ where: { userId } }),
    prisma.hydrationLog.deleteMany({ where: { userId } }),
    prisma.sideEffectLog.deleteMany({ where: { userId } }),
    prisma.doseLog.deleteMany({ where: { stackItem: { userId } } }),
    prisma.stackItem.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
