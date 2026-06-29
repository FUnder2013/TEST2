import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const userId = session.user.id;
  const [profile, stackItems, orders, foodLogs, weightLogs, sleepLogs, hydrationLogs, sideEffectLogs, consultRequests] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.stackItem.findMany({ where: { userId }, include: { peptide: true, doseLogs: true } }),
      prisma.order.findMany({ where: { userId }, include: { items: true } }),
      prisma.foodLog.findMany({ where: { userId } }),
      prisma.weightLog.findMany({ where: { userId } }),
      prisma.sleepLog.findMany({ where: { userId } }),
      prisma.hydrationLog.findMany({ where: { userId } }),
      prisma.sideEffectLog.findMany({ where: { userId } }),
      prisma.consultRequest.findMany({ where: { userId } }),
    ]);

  const data = {
    exportedAt: new Date().toISOString(),
    profile,
    stackItems,
    orders,
    foodLogs,
    weightLogs,
    sleepLogs,
    hydrationLogs,
    sideEffectLogs,
    consultRequests,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=peptidestack-export.json",
    },
  });
}
