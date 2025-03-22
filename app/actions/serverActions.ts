"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get total assets value
    const assets = await db.asset.findMany({
      where: { userId },
      select: {
        currentValue: true,
      },
    });

    const totalAssetsValue = assets.reduce(
      (sum, asset) => sum + (asset.currentValue || 0),
      0
    );

    // Get active goals count
    const activeGoalsCount = await db.goal.count({
      where: {
        userId,
        completedDate: null,
      },
    });

    // Calculate monthly growth
    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );

    const monthlyPerformance = await db.assetPerformance.findMany({
      where: {
        asset: {
          userId,
        },
        period: "one_month",
      },
      orderBy: {
        assetId: "asc",
      },
    });

    const monthlyGrowth =
      monthlyPerformance.reduce((sum, perf) => sum + perf.return, 0) /
      (monthlyPerformance.length || 1);

    // Get recent goals
    const goals = await db.goal.findMany({
      where: {
        userId,
        completedDate: null,
      },
      orderBy: {
        targetDate: "asc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        currentAmt: true,
        targetAmt: true,
        targetDate: true,
        priority: true,
      },
    });

    // Get recent assets
    const recentAssets = await db.asset.findMany({
      where: {
        userId,
      },
      orderBy: {
        purchaseDate: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        type: true,
        currentValue: true,
        purchasePrice: true,
        symbol: true,
        risk: true,
      },
    });

    return {
      totalAssetsValue,
      activeGoalsCount,
      monthlyGrowth,
      goals,
      recentAssets,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}
