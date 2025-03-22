"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoalKeyword, GoalPriority, RiskLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
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

interface OnboardingData extends GoalData {
  dateOfBirth: Date;
  selectedGoal: string;
  [key: string]: any;
}

interface GoalData {
  name?: string;
  cost: number;
  years: number;
  upfrontAmount?: number;
  
  // Home specific fields
  takingLoan?: 'yes' | 'no';
  downPaymentPercentage?: number;
  riskLevel?: 'High' | 'Medium' | 'Low';

  // Retirement specific fields
  monthlyExpenses?: number;
  retirementAge?: number;

  // Wedding specific fields
  guestCount?: number;
  includeHoneymoon?: 'yes' | 'no';

  // Emergency Fund specific fields
  monthlyIncome?: number;
  desiredCoverageMonths?: number;

  // Business specific fields
  businessType?: string;
  employeeCount?: number;

  // Health specific fields
  insuranceCoverage?: number;
  familySize?: number;

  // Charity specific fields
  donationType?: 'one_time' | 'recurring';
  recurringAmount?: number;

  // Debt Repayment specific fields
  debtType?: 'credit_card' | 'personal_loan' | 'student_loan' | 'other';
  interestRate?: number;
  minimumPayment?: number;

  // Custom goal fields
  customGoalName?: string;
}

const getGoalKeywordFromId = (goalId: string): GoalKeyword => {
  const mapping: { [key: string]: GoalKeyword } = {
    'ownHome': 'home',
    'retireEasy': 'retirement',
    'wedding': 'wedding',
    'emergencyFund': 'emergency_fund',
    'business': 'business',
    'health': 'health',
    'charity': 'charity',
    'debtRepayment': 'debt_repayment',
    'buyCar': 'car',
    'vacation': 'travel',
    'educateChild': 'education',
    'customGoal': 'other'
  };
  return mapping[goalId] || 'other';
};

const getRiskLevelFromString = (risk?: 'High' | 'Medium' | 'Low'): RiskLevel | undefined => {
  if (!risk) return undefined;
  const mapping: { [key: string]: RiskLevel } = {
    'High': 'high',
    'Medium': 'moderate',
    'Low': 'low'
  };
  return mapping[risk];
};

export async function completeOnboarding(data: OnboardingData) {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");
  if (!userId) throw new Error("Unauthorized");

  const email = clerkUser.emailAddresses[0].emailAddress;

  try {
    // Update user with onboarding data
    await db.user.upsert({
      where: { id: userId },
      update: {
        birthDate: data.dateOfBirth,
        onboardingDone: new Date()
      },
      create: {
        id: userId,
        email: email,
        birthDate: data.dateOfBirth,
        onboardingDone: new Date()
      }
    });

    // Create goal with the data
    await createGoal(data);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw new Error("Failed to complete onboarding");
  }
}

export async function createGoal(data: OnboardingData & GoalData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + data.years);

    const goalKeyword = getGoalKeywordFromId(data.selectedGoal);
    const riskLevel = getRiskLevelFromString(data.riskLevel);

    const goal = await db.goal.create({
      data: {
        userId,
        name: data.customGoalName || data.selectedGoal,
        keywords: [goalKeyword],
        currentAmt: data.upfrontAmount || 0,
        targetAmt: data.cost,
        targetAmtInflationAdjusted: data.cost * Math.pow(1.06, data.years), // 6% inflation
        targetDate:targetDate.toISOString(),
        priority: 'high' as GoalPriority,
  
        // Home specific fields
        isHomeLoan: data.takingLoan === 'yes',
        downPaymentPercentage: data.downPaymentPercentage,
        riskLevel,
  
        // Retirement specific fields
        monthlyExpenses: data.monthlyExpenses,
        retirementAge: data.retirementAge,
  
        // Wedding specific fields
        guestCount: data.guestCount,
        includeHoneymoon: data.includeHoneymoon === 'yes',
  
        // Emergency Fund specific fields
        monthlyIncome: data.monthlyIncome,
        desiredCoverageMonths: data.desiredCoverageMonths,
  
        // Business specific fields
        businessType: data.businessType,
        employeeCount: data.employeeCount,
  
        // Health specific fields
        insuranceCoverage: data.insuranceCoverage,
        familySize: data.familySize,
  
        // Charity specific fields
        donationType: data.donationType,
        recurringAmount: data.recurringAmount,
  
        // Debt Repayment specific fields
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        debtType: data.debtType,
  
        // Custom goal fields
        customGoalName: data.customGoalName
      },
    });

    return goal;
  } catch (error) {
    console.error("Error creating goal:", error);
    throw new Error("Failed to create goal");
  }
}

export async function getOnBoardingDone() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: userId }, select: { onboardingDone: true } });
  if(!user) return false;
  if(!user.onboardingDone) return false;
  return true;
}