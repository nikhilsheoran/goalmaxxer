"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoalKeyword, GoalPriority, RiskLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

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
        description: true,
        currentAmt: true,
        targetAmt: true,
        targetDate: true,
        priority: true,
        keywords: true,
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

<<<<<<< HEAD
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
=======
export async function fetchStockData(symbol: string, period1: number, period2: number, interval: string = '1d') {
  if (!symbol) {
    return {
      symbol: '',
      currency: 'USD',
      prices: [],
      isMockData: true,
      error: 'Symbol is required'
    };
  }

  try {
    // Set up AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Yahoo Finance API URL
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
      next: { revalidate: 3600 } // Cache for 1 hour
    }).catch(err => {
      console.error('Fetch error:', err);
      clearTimeout(timeoutId);
      return null;
    });
    
    clearTimeout(timeoutId);

    // Handle null response (e.g., network error)
    if (!response) {
      console.error('Network error when fetching data');
      return generateMockStockData(symbol, period1, period2, interval);
    }

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.statusText} (${response.status})`);
      return generateMockStockData(symbol, period1, period2, interval);
    }

    const data = await response.json().catch(err => {
      console.error('JSON parse error:', err);
      return null;
    });
    
    // Handle JSON parse error
    if (!data) {
      console.error('Failed to parse response JSON');
      return generateMockStockData(symbol, period1, period2, interval);
    }
    
    // Verify the data structure and handle potential errors
    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      console.error('Invalid data structure received from Yahoo Finance');
      return generateMockStockData(symbol, period1, period2, interval);
    }

    // Check for Yahoo Finance errors
    if (data.chart.error) {
      console.error(`Yahoo Finance error: ${data.chart.error.description}`);
      return generateMockStockData(symbol, period1, period2, interval);
    }
    
    // Extract just what we need from the Yahoo Finance response
    const result = data.chart.result[0];
    
    // Check if we have valid data in the response
    if (!result.timestamp || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
      console.error('No price data available for this symbol');
      return generateMockStockData(symbol, period1, period2, interval);
    }
    
    // Format the response for our client
    const formattedData = {
      symbol: result.meta.symbol,
      currency: result.meta.currency,
      prices: result.timestamp.map((timestamp: number, index: number) => {
        // Handle potentially missing data points (some might be null)
        const close = result.indicators.quote[0].close?.[index] ?? null;
        const open = result.indicators.quote[0].open?.[index] ?? null;
        const high = result.indicators.quote[0].high?.[index] ?? null;
        const low = result.indicators.quote[0].low?.[index] ?? null;
        const volume = result.indicators.quote[0].volume?.[index] ?? null;
        
        return {
          date: timestamp,
          close,
          open,
          high,
          low,
          volume,
        };
      }).filter((item: any) => item.close !== null), // Filter out any null values
      isMockData: false
    };

    return formattedData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    // Return mock data instead of throwing
    return generateMockStockData(symbol, period1, period2, interval);
  }
}

// Generate mock stock data when Yahoo Finance API fails
function generateMockStockData(symbol: string, period1: number, period2: number, interval: string) {
  console.log(`Generating mock data for ${symbol} from ${new Date(period1 * 1000).toLocaleDateString()} to ${new Date(period2 * 1000).toLocaleDateString()}`);
  
  try {
    const startDate = new Date(period1 * 1000);
    const endDate = new Date(period2 * 1000);
    const timestamps: number[] = [];
    const prices: any[] = [];
    
    // Determine time step based on interval
    let timeStep: number;
    switch (interval) {
      case '1m':
      case '2m': 
      case '5m':
      case '15m':
      case '30m':
        timeStep = 60 * 1000 * parseInt(interval.replace('m', '')); // minutes in ms
        break;
      case '60m':
      case '90m':
        timeStep = 60 * 60 * 1000 * (interval === '60m' ? 1 : 1.5); // hours in ms
        break;
      case '1h':
        timeStep = 60 * 60 * 1000; // 1 hour in ms
        break;
      case '1d':
        timeStep = 24 * 60 * 60 * 1000; // 1 day in ms
        break;
      case '5d':
      case '1wk':
        timeStep = 7 * 24 * 60 * 60 * 1000; // 1 week in ms
        break;
      case '1mo':
      case '3mo':
        timeStep = 30 * 24 * 60 * 60 * 1000 * (interval === '1mo' ? 1 : 3); // months in ms
        break;
      default:
        timeStep = 24 * 60 * 60 * 1000; // default to 1 day
    }
    
    // Generate timestamps
    let currentTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    // If the range is very large, limit the number of data points
    const maxPoints = 200;
    const totalDuration = endTime - currentTime;
    const calculatedStep = Math.max(timeStep, Math.ceil(totalDuration / maxPoints));
    
    // Generate timestamps and mock prices
    let basePrice = 100 + Math.random() * 100; // Random starting price between 100 and 200
    let currentPrice = basePrice;
    
    while (currentTime <= endTime) {
      timestamps.push(Math.floor(currentTime / 1000)); // Convert to seconds for Yahoo API compatibility
      
      // Simulate price movement
      // More realistic market-like movements with slight upward bias
      const change = (Math.random() - 0.48) * 0.02 * basePrice;
      currentPrice = Math.max(0.1, currentPrice + change); // Ensure price doesn't go below 0.1
      
      // Add some randomness to create market-like patterns
      const open = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
      const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.01);
      const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.01);
      
      prices.push({
        close: currentPrice,
        open: open,
        high: high,
        low: low,
        volume: Math.floor(Math.random() * 10000000) + 500000 // Random volume
      });
      
      currentTime += calculatedStep;
    }
    
    // Ensure we have at least some data points
    if (timestamps.length === 0) {
      // If no data points were generated, create at least one
      const timestamp = Math.floor(Date.now() / 1000);
      timestamps.push(timestamp);
      prices.push({
        close: 100,
        open: 98,
        high: 102,
        low: 97,
        volume: 1000000
      });
    }
    
    return {
      symbol: symbol,
      currency: 'USD', // Default currency for mock data
      prices: timestamps.map((timestamp, index) => ({
        date: timestamp,
        close: prices[index].close,
        open: prices[index].open,
        high: prices[index].high,
        low: prices[index].low,
        volume: prices[index].volume
      })),
      isMockData: true // Flag to indicate this is mock data
    };
  } catch (error) {
    console.error('Error generating mock data:', error);
    // Return a minimal mock dataset if even mock generation fails
    return {
      symbol: symbol,
      currency: 'USD',
      prices: [
        {
          date: Math.floor(Date.now() / 1000),
          close: 100,
          open: 98,
          high: 102,
          low: 97,
          volume: 1000000
        }
      ],
      isMockData: true
    };
  }
}
>>>>>>> 5b46b93 (added graphs for asset)
