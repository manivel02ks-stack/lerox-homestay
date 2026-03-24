import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);
    const startLastMonth = startOfMonth(subMonths(now, 1));
    const endLastMonth = endOfMonth(subMonths(now, 1));

    const [
      totalRooms,
      activeRooms,
      totalBookings,
      confirmedBookings,
      thisMonthBookings,
      lastMonthBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: startMonth, lte: endMonth },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
        _count: true,
      }),
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: startLastMonth, lte: endLastMonth },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
        _count: true,
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          room: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    const thisMonthRevenue = thisMonthBookings._sum.totalPrice || 0;
    const lastMonthRevenue = lastMonthBookings._sum.totalPrice || 0;
    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return NextResponse.json({
      stats: {
        totalRooms,
        activeRooms,
        totalBookings,
        confirmedBookings,
        thisMonthRevenue,
        thisMonthBookings: thisMonthBookings._count,
        revenueGrowth: Math.round(revenueGrowth),
        occupancyRate:
          totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0,
      },
      recentBookings,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
