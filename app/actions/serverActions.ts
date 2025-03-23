"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  RiskCapacity,
  GoalKeyword,
  GoalPriority,
  AssetType,
  RiskLevel,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

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
      (sum: number, asset: { currentValue: number | null }) =>
        sum + (asset.currentValue || 0),
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
      monthlyPerformance.reduce(
        (sum: number, perf: { return: number }) => sum + perf.return,
        0
      ) / (monthlyPerformance.length || 1);

    // Get recent goals
    const goals = await db.goal.findMany({
      where: {
        userId,
        completedDate: null,
      },
      orderBy: {
        targetDate: "asc",
      },
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
      select: {
        id: true,
        name: true,
        type: true,
        currentValue: true,
        purchasePrice: true,
        purchaseDate: true,
        quantity: true,
        symbol: true,
        risk: true,
        currency: true,
        goalId: true,
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

export interface OnboardingData extends GoalData {
  dateOfBirth: Date;
  selectedGoal: string;
  [key: string]: any;
}

export interface GoalData {
  name?: string;
  description?: string;
  cost: number;
  years: number;
  upfrontAmount?: number;
  riskLevel?: "High" | "Medium" | "Low";
  takingLoan?: "yes" | "no";
  downPaymentPercentage?: number;
  monthlyExpenses?: number;
  retirementAge?: number;
  guestCount?: number;
  includeHoneymoon?: "yes" | "no";
  monthlyIncome?: number;
  desiredCoverageMonths?: number;
  businessType?: string;
  employeeCount?: number;
  insuranceCoverage?: number;
  familySize?: number;
  donationType?: "one_time" | "recurring";
  recurringAmount?: number;
  debtType?: "credit_card" | "personal_loan" | "student_loan" | "other";
  interestRate?: number;
  minimumPayment?: number;
  customGoalName?: string;
  priority?: GoalPriority;
  targetDate?: Date;
  selectedGoal?: string;
}

const getGoalKeywordFromId = (goalId: string): GoalKeyword => {
  const mapping: { [key: string]: GoalKeyword } = {
    ownHome: "home",
    retireEasy: "retirement",
    wedding: "wedding",
    emergencyFund: "emergency_fund",
    business: "business",
    health: "health",
    charity: "charity",
    debtRepayment: "debt_repayment",
    buyCar: "car",
    vacation: "travel",
    educateChild: "education",
    customGoal: "other",
  };
  return mapping[goalId] || "other";
};

const getRiskLevelFromString = (
  risk?: "High" | "Medium" | "Low"
): RiskLevel | undefined => {
  if (!risk) return undefined;
  const mapping: { [key: string]: RiskLevel } = {
    High: "high",
    Medium: "moderate",
    Low: "low",
  };
  return mapping[risk];
};

export async function completeOnboarding(data: OnboardingData) {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");
  if (!userId) throw new Error("Unauthorized");

  const email = clerkUser.emailAddresses[0].emailAddress;
  const name = clerkUser.firstName + " " + clerkUser.lastName;

  try {
    // Update user with onboarding data
    await db.user.upsert({
      where: { id: userId },
      update: {
        birthDate: data.dateOfBirth,
        onboardingDone: new Date(),
      },
      create: {
        id: userId,
        email: email,
        name: name,
        birthDate: data.dateOfBirth,
        onboardingDone: new Date(),
      },
    });

    // Create goal with the data
    await createGoal(data);
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

    const goalKeyword = getGoalKeywordFromId(data.selectedGoal || "");
    const riskLevel = getRiskLevelFromString(data.riskLevel);

    // Calculate target amount for emergency fund
    let targetAmount = data.cost;
    if (data.selectedGoal === "emergencyFund" && data.monthlyIncome && data.desiredCoverageMonths) {
      targetAmount = data.monthlyIncome * data.desiredCoverageMonths;
    }

    const goal = await db.goal.create({
      data: {
        userId,
        name: data.customGoalName || data.name || data.selectedGoal,
        keywords: [goalKeyword],
        currentAmt: data.upfrontAmount || 0,
        targetAmt: targetAmount,
        targetAmtInflationAdjusted: targetAmount * Math.pow(1.06, data.years), // 6% inflation
        targetDate: targetDate.toISOString(),
        priority: "high" as GoalPriority,

        // Home specific fields
        isHomeLoan: data.takingLoan === "yes",
        downPaymentPercentage: data.downPaymentPercentage,
        riskLevel,

        // Retirement specific fields
        monthlyExpenses: data.monthlyExpenses,
        retirementAge: data.retirementAge,

        // Wedding specific fields
        guestCount: data.guestCount,
        includeHoneymoon: data.includeHoneymoon === "yes",

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
        customGoalName: data.customGoalName,
      },
    });
    revalidatePath("/dashboard");

    return goal;
  } catch (error) {
    console.error("Error creating goal:", error);
    throw new Error("Failed to create goal");
  }
}

export async function getOnBoardingDone() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingDone: true },
  });
  if (!user) return false;
  if (!user.onboardingDone) return false;
  return true;
}
export async function fetchStockData(
  symbol: string,
  period1: number,
  period2: number,
  interval: string = "1d"
) {
  if (!symbol) {
    return {
      symbol: "",
      currency: "USD",
      prices: [],
      isMockData: true,
      error: "Symbol is required",
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
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cache for 1 hour
    }).catch((err) => {
      console.error("Fetch error:", err);
      clearTimeout(timeoutId);
      return null;
    });

    clearTimeout(timeoutId);

    // Handle null response (e.g., network error)
    if (!response) {
      console.error("Network error when fetching data");
      return generateMockStockData(symbol, period1, period2, interval);
    }

    if (!response.ok) {
      console.error(
        `Yahoo Finance API error: ${response.statusText} (${response.status})`
      );
      return generateMockStockData(symbol, period1, period2, interval);
    }

    const data = await response.json().catch((err) => {
      console.error("JSON parse error:", err);
      return null;
    });

    // Handle JSON parse error
    if (!data) {
      console.error("Failed to parse response JSON");
      return generateMockStockData(symbol, period1, period2, interval);
    }

    // Verify the data structure and handle potential errors
    if (
      !data ||
      !data.chart ||
      !data.chart.result ||
      data.chart.result.length === 0
    ) {
      console.error("Invalid data structure received from Yahoo Finance");
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
    if (
      !result.timestamp ||
      !result.indicators ||
      !result.indicators.quote ||
      !result.indicators.quote[0]
    ) {
      console.error("No price data available for this symbol");
      return generateMockStockData(symbol, period1, period2, interval);
    }

    // Format the response for our client
    const formattedData = {
      symbol: result.meta.symbol,
      currency: result.meta.currency,
      prices: result.timestamp
        .map((timestamp: number, index: number) => {
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
        })
        .filter((item: any) => item.close !== null), // Filter out any null values
      isMockData: false,
    };

    return formattedData;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    // Return mock data instead of throwing
    return generateMockStockData(symbol, period1, period2, interval);
  }
}

// Generate mock stock data when Yahoo Finance API fails
function generateMockStockData(
  symbol: string,
  period1: number,
  period2: number,
  interval: string
) {
  console.log(
    `Generating mock data for ${symbol} from ${new Date(
      period1 * 1000
    ).toLocaleDateString()} to ${new Date(period2 * 1000).toLocaleDateString()}`
  );

  try {
    const startDate = new Date(period1 * 1000);
    const endDate = new Date(period2 * 1000);
    const timestamps: number[] = [];
    const prices: any[] = [];

    // Determine time step based on interval
    let timeStep: number;
    switch (interval) {
      case "1m":
      case "2m":
      case "5m":
      case "15m":
      case "30m":
        timeStep = 60 * 1000 * parseInt(interval.replace("m", "")); // minutes in ms
        break;
      case "60m":
      case "90m":
        timeStep = 60 * 60 * 1000 * (interval === "60m" ? 1 : 1.5); // hours in ms
        break;
      case "1h":
        timeStep = 60 * 60 * 1000; // 1 hour in ms
        break;
      case "1d":
        timeStep = 24 * 60 * 60 * 1000; // 1 day in ms
        break;
      case "5d":
      case "1wk":
        timeStep = 7 * 24 * 60 * 60 * 1000; // 1 week in ms
        break;
      case "1mo":
      case "3mo":
        timeStep = 30 * 24 * 60 * 60 * 1000 * (interval === "1mo" ? 1 : 3); // months in ms
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
    const calculatedStep = Math.max(
      timeStep,
      Math.ceil(totalDuration / maxPoints)
    );

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
        volume: Math.floor(Math.random() * 10000000) + 500000, // Random volume
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
        volume: 1000000,
      });
    }

    return {
      symbol: symbol,
      currency: "USD", // Default currency for mock data
      prices: timestamps.map((timestamp, index) => ({
        date: timestamp,
        close: prices[index].close,
        open: prices[index].open,
        high: prices[index].high,
        low: prices[index].low,
        volume: prices[index].volume,
      })),
      isMockData: true, // Flag to indicate this is mock data
    };
  } catch (error) {
    console.error("Error generating mock data:", error);
    // Return a minimal mock dataset if even mock generation fails
    return {
      symbol: symbol,
      currency: "USD",
      prices: [
        {
          date: Math.floor(Date.now() / 1000),
          close: 100,
          open: 98,
          high: 102,
          low: 97,
          volume: 1000000,
        },
      ],
      isMockData: true,
    };
  }
}

export interface AssetData {
  name: string;
  type: AssetType;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  risk?: RiskLevel;
  currency: string;
  goalId?: string;
  institution?: string;
  interestRate?: number;
  tenureMonths?: number;
  [key: string]: any;
}

export async function createAsset(data: AssetData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    console.log("Creating asset with data:", data);

    // Validate goal ownership if goalId is provided
    if (data.goalId) {
      const goal = await db.goal.findFirst({
        where: {
          id: data.goalId,
          userId: userId,
        },
      });

      if (!goal) {
        throw new Error(
          "Invalid goal selected or goal does not belong to user"
        );
      }
    }

    // Create a unique holding ID
    const holdingId = `${userId}-${Date.now()}`;

    // Create the base asset
    const asset = await db.asset.create({
      data: {
        userId,
        holdingId,
        name: data.name,
        type: data.type,
        symbol: data.symbol,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        risk: data.risk,
        currency: data.currency,
        currentValue: data.quantity * data.purchasePrice, // Initial value
        goalId: data.goalId,
      },
    });

    console.log("Base asset created:", asset);

    // Create type-specific details
    switch (data.type) {
      case "stock":
        await db.stock.create({
          data: {
            assetId: asset.id,
          },
        });
        break;
      case "mf":
        await db.mutualFund.create({
          data: {
            assetId: asset.id,
          },
        });
        break;
      case "etf":
        await db.eTF.create({
          data: {
            assetId: asset.id,
          },
        });
        break;
      case "fd":
        if (!data.institution || !data.interestRate || !data.tenureMonths) {
          throw new Error("Missing required fields for Fixed Deposit");
        }
        await db.fixedDeposit.create({
          data: {
            assetId: asset.id,
            institution: data.institution,
            interestRate: data.interestRate,
            tenureMonths: data.tenureMonths,
          },
        });
        break;
    }

    // Update goal's currentAmt if the asset is linked to a goal
    if (data.goalId) {
      await db.goal.update({
        where: { id: data.goalId },
        data: {
          currentAmt: {
            increment: data.quantity * data.purchasePrice,
          },
        },
      });
    }

    revalidatePath("/dashboard/investments");
    return asset;
  } catch (error) {
    console.error("Detailed error creating asset:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create asset: ${error.message}`);
    }
    throw new Error("Failed to create asset");
  }
}

export async function getGoals() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const goals = await db.goal.findMany({
      where: {
        user: { id: userId },
        completedDate: null,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        targetDate: "asc",
      },
    });

    return { goals };
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw new Error("Failed to fetch goals");
  }
}

export async function getInvestmentSuggestions(goalData: GoalData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const riskLevel = getRiskLevelFromString(goalData.riskLevel);
    const goalKeyword = getGoalKeywordFromId(goalData.selectedGoal || "");

    const llmResponse = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        suggestions: z
          .array(
            z
              .object({
                name: z.string().describe("The name of the investment"),
                type: z.enum(["stock", "mf", "etf", "fd"]).describe("The type of the investment"),
                symbol: z.string().describe("The symbol of the investment"),
                quantity: z.number().describe("The quantity of the investment"),
                purchasePrice: z
                  .number()
                  .describe("The purchase price of the investment"),
                risk: z.enum(["high", "moderate", "low"]).describe("The risk level of the investment"),
                description: z
                  .string()
                  .describe("A short description of the investment"),
                expectedReturn: z
                  .number()
                  .describe("The expected return of the investment"),
                currency: z.string().describe("The currency of the investment"),
              })
              .describe("One particular investment suggestion")
          )
          .describe("The investment suggestions"),
      }),
      system: `You are an expert financial advisor tasked with generating personalized investment suggestions for a user's financial goal. Your goal is to provide a list of investment options (stocks) that align with the user's risk tolerance, investment horizon, and target amount, using the provided stock data categorized by risk level (High, Moderate, Low) based on Sharpe Ratio and CAGR.

### Instructions:
1. **Input Interpretation:**
   - The input is a JSON object (goalData) containing:
     - 'name' (string): The goal's name (e.g., "House Down Payment").
     - 'target_amount' (number): The amount to achieve (e.g., 50000).
     - 'timeframe_years' (number): Years to reach the goal (e.g., 5).
     - 'risk_level' (string): User's risk tolerance ("high", "moderate", "low"), derived from a risk assessment.
   - If any field is missing, assume defaults: 'target_amount = 10000', 'timeframe_years = 5', 'risk_level = "moderate"'.

2. **Stock Data Usage:**
   - Use the provided stock tables categorized by risk:
     - High Risk: Sharpe < 0.8
     - Moderate Risk: 0.8 <= Sharpe < 1.6
     - Low Risk: Sharpe >= 1.6
   - Each table lists stocks with 'Ticker' (symbol), 'CAGR' (compound annual growth rate), and 'Sharpe Ratio'.
   - Select stocks only from the category matching the user's 'risk_level'.

3. **Selection Criteria:**
   - Choose 3-5 stocks from the relevant risk category.
   - For high risk, 30% investment in mutual funds and 70% investment in stocks.
   - For moderate risk, 50% investment in mutual funds and 50% investment in stocks.
   - For low risk, 70% investment in mutual funds and 30% investment in stocks.
   - Prioritize stocks with higher CAGR within the category to maximize potential returns.
   - Ensure diversity (e.g., avoid selecting multiple stocks from the same sector if possible, based on ticker naming patterns).

4. **Output Structure:**
   - Return an array of investment suggestions matching the schema:
     - 'name': Full stock name (infer from ticker, e.g., "Metro Brands" for "METROBRAND.NS").
     - 'type': Set as "Stock".
     - 'symbol': Ticker from the table (e.g., "METROBRAND.NS").
     - 'quantity': Calculate based on 'target_amount' / (3-5 stocks) / 'purchasePrice' (round to nearest integer).
     - 'purchasePrice': Estimate as 1000 INR (default, since actual prices aren't provided).
     - 'risk': Match user's 'risk_level' ("high", "moderate", "low").
     - 'description': Generate a brief description (e.g., "A high-growth stock in the [inferred sector] sector with [CAGR]% CAGR").
     - 'expectedReturn': Use the stock's CAGR from the table as the expected annual return.
     - 'currency': Set as "INR" (Indian Rupees, based on .NS tickers).

5. **Constraints:**
   - Do not invent stocks outside the provided tables.
   - If fewer than 3 stocks are available in a category, use all available ones.
   - Ensure 'quantity' and 'purchasePrice' result in a total investment close to 'target_amount' when summed across suggestions.

6. **Example:**
   - Input: '{"name": "House", "target_amount": 50000, "timeframe_years": 5, "risk_level": "low"}'
   - Output: [
       {
         "name": "Kaynes Technology",
         "type": "Stock",
         "symbol": "KAYNES.NS",
         "quantity": 16,
         "purchasePrice": 1000,
         "risk": "low",
         "description": "A high-growth stock in the tech sector with 77.84% CAGR",
         "expectedReturn": 77.84,
         "currency": "INR"
       },
       ...
     ]

Use the stock data below to generate suggestions for the goal provided in the prompt.

      
      === High Risk (Sharpe < 0.8) Stocks by CAGR ===
       Ticker   CAGR  Sharpe Ratio
METROBRAND.NS 16.84%          0.69
      CAMS.NS 16.12%          0.65
UJJIVANSFB.NS 15.82%          0.65
JUBLINGREA.NS 13.26%          0.72
     GICRE.NS 13.12%          0.71
     PAYTM.NS 12.96%          0.70
   GMDCLTD.NS 11.54%          0.75
     NIACL.NS 11.34%          0.49
EASEMYTRIP.NS 10.53%          0.44
      GSFC.NS  9.94%          0.79

=== Moderate Risk (0.8 <= Sharpe < 1.6) Stocks by CAGR ===
       Ticker   CAGR  Sharpe Ratio
   RAINBOW.NS 29.97%          1.29
DATAPATTNS.NS 29.23%          0.94
      GRSE.NS 28.04%          1.55
    BIKAJI.NS 27.36%          1.16
   RAILTEL.NS 26.99%          1.28
    NEWGEN.NS 24.28%          1.25
      ATGL.NS 23.96%          1.14
     AMBER.NS 23.80%          1.31
     HUDCO.NS 22.60%          1.02
  TEJASNET.NS 21.74%          0.89

=== Low Risk (Sharpe >= 1.6) Stocks by CAGR ===
       Ticker   CAGR  Sharpe Ratio
    ZOMATO.NS 40.18%          1.63
   MAZDOCK.NS 36.47%          2.24
      RVNL.NS 33.62%          1.70
POWERINDIA.NS 31.27%          1.79
  KFINTECH.NS 30.90%          1.86

  === High Risk (Sharpe < 0.8) Stocks by Sharpe Ratio ===
       Ticker  CAGR  Sharpe Ratio
      GSFC.NS 9.94%          0.79
 LICHSGFIN.NS 6.45%          0.79
    SANOFI.NS 5.16%          0.79
 ENDURANCE.NS 4.00%          0.79
   INDIANB.NS 4.94%          0.78
KARURVYSYA.NS 5.41%          0.78
  NLCINDIA.NS 4.45%          0.78
       IRB.NS 0.79%          0.77
       UBL.NS 3.96%          0.77
BIRLACORPN.NS 7.07%          0.76

=== Moderate Risk (0.8 <= Sharpe < 1.6) Stocks by Sharpe Ratio ===
       Ticker   CAGR  Sharpe Ratio
       VBL.NS 16.30%          1.58
      GRSE.NS 28.04%          1.55
 SOLARINDS.NS 10.32%          1.55
AVANTIFEED.NS 11.87%          1.53
BAJFINANCE.NS 11.63%          1.52
AJANTPHARM.NS 11.93%          1.52
       BSE.NS 15.54%          1.51
    VIJAYA.NS 10.10%          1.49
 APLAPOLLO.NS 14.54%          1.48
   TIINDIA.NS 17.07%          1.46

=== Low Risk (Sharpe >= 1.6) Stocks by Sharpe Ratio ===
       Ticker   CAGR  Sharpe Ratio
KALYANKJIL.NS 19.38%          1.91
  KFINTECH.NS 16.90%          1.86
POWERINDIA.NS 18.27%          1.79
 PPLPHARMA.NS 24.61%          1.78
     DIXON.NS 20.88%          1.74

TOP 10 PERFORMING MUTUAL FUNDS:
Scheme Name   CAGR (%)  Sharpe Ratio  Volatility (%)
435    Goldman Sachs India Equity Fund - Dividend Plan  25.249365      1.797106       14.417326
431  Aditya Birla Sun Life Liquid Fund-Retail (Growth)  24.707017      0.256846       11.657032
428                         Mirae Asset Large Cap Fund  18.646674      1.763844       14.578153
427  Motilal Oswal MSCI EAFE Top 100 Select Index F...  17.609749      2.160450       12.635760
426  Aditya Birla Sun Life Liquid Fund -Institution...  16.593592      0.230988       12.416143
423  WhiteOak Capital Large Cap Fund Direct Plan Gr...  14.593310      1.052297       13.487644
422  BNP Paribas Dynamic Equity Fund - Regular Plan...  13.578552      2.577028        9.628129
421  SBI Balanced Advantage Fund - Regular Plan - G...  13.189335      2.345011        5.259180
419  Edelweiss MSCI India Domestic & World Healthca...  12.267225      1.787688       11.202617
417                     ICICI Prudential Bluechip Fund  11.886754      1.379580       13.333593

AVERAGE PERFORMING LOW VOLATILITY MUTUAL FUNDS:
Scheme Name  CAGR (%)  Sharpe Ratio  Volatility (%)
168  DWS Hybrid Fixed TErm Fund - Series 1 - Divide...  1.474459      0.704136        3.095453
166      HSBC Corporate Bond Fund - Direct Annual IDCW  1.451648      3.050533        2.506863
161              IDBI Short Term Bond Fund Weekly IDCW  1.350508      0.455068        1.823678
171  Mirae Asset Nifty AAA PSU Bond Plus SDL Apr 20...  1.618769      6.151869        0.476450
172                       Bharat Bond ETF - April 2023  1.659809      4.296321        0.699076
174  DSP BlackRock Strategic Bond Fund - Regular Pl...  1.697725      1.270030        1.605497
155  SBI Liquid Fund - Direct Paln - Fortnightly In...  1.108649      1.084264        0.700632
153  CANARA ROBECO GILT FUND - DIRECT PLAN - GROWTH...  1.051458      0.619796        2.986713
181  Kotak Equity Arbitrage Fund -Payout of Income ...  1.887915      3.258676        2.194480
150  Edelweiss Corporate Bond Fund - Regular Plan -...  0.976599      0.343365        3.055290
      `,
      prompt: `Generate investment suggestions for the following goal: ${JSON.stringify(
        goalData
      )}`,
    });

    const actualSuggestions = llmResponse.object.suggestions;

    return { suggestions: actualSuggestions };
  } catch (error) {
    console.error("Error getting investment suggestions:", error);
    throw new Error("Failed to get investment suggestions");
  }
}

// Search assets by name or symbol
export async function searchAssets(query: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const assets = await db.asset.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { symbol: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        goal: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return { assets };
  } catch (error) {
    console.error("Error searching assets:", error);
    throw new Error("Failed to search assets");
  }
}

// Delete an asset
export async function deleteAsset(assetId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get the asset to check ownership and get goal info
    const asset = await db.asset.findFirst({
      where: {
        id: assetId,
        userId
      },
      include: {
        goal: true
      }
    });

    if (!asset) {
      throw new Error("Asset not found or unauthorized");
    }

    // If asset is linked to a goal, update goal's currentAmt
    if (asset.goalId) {
      await db.goal.update({
        where: { id: asset.goalId },
        data: {
          currentAmt: {
            decrement: asset.currentValue || 0
          }
        }
      });
    }

    // Delete the asset
    await db.asset.delete({
      where: { id: assetId }
    });

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw new Error("Failed to delete asset");
  }
}

// Update an asset
export async function updateAsset(assetId: string, data: Partial<AssetData>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get current asset to check ownership
    const currentAsset = await db.asset.findFirst({
      where: {
        id: assetId,
        userId
      }
    });

    if (!currentAsset) {
      throw new Error("Asset not found or unauthorized");
    }

    // Update the asset
    const updatedAsset = await db.asset.update({
      where: { id: assetId },
      data: {
        name: data.name,
        symbol: data.symbol,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate,
        risk: data.risk,
        currency: data.currency,
        currentValue: data.quantity ? data.quantity * (data.purchasePrice || currentAsset.purchasePrice) : currentAsset.currentValue,
        goalId: data.goalId
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/investments");
    return { success: true, asset: updatedAsset };
  } catch (error) {
    console.error("Error updating asset:", error);
    throw new Error("Failed to update asset");
  }
}

// Search goals by name or keyword
export async function searchGoals(query: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const goals = await db.goal.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: [query as GoalKeyword] } }
        ]
      },
      include: {
        assets: {
          select: {
            id: true,
            name: true,
            currentValue: true
          }
        }
      }
    });

    return { goals };
  } catch (error) {
    console.error("Error searching goals:", error);
    throw new Error("Failed to search goals");
  }
}

// Delete a goal
export async function deleteGoal(goalId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get the goal to check ownership
    const goal = await db.goal.findFirst({
      where: {
        id: goalId,
        userId
      }
    });

    if (!goal) {
      throw new Error("Goal not found or unauthorized");
    }

    // Delete the goal (this will also update related assets)
    await db.goal.delete({
      where: { id: goalId }
    });

    revalidatePath("/dashboard/goals");
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw new Error("Failed to delete goal");
  }
}

// Update a goal
export async function updateGoal(goalId: string, data: Partial<GoalData>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get current goal to check ownership
    const currentGoal = await db.goal.findFirst({
      where: {
        id: goalId,
        userId
      }
    });

    if (!currentGoal) {
      throw new Error("Goal not found or unauthorized");
    }

    // Calculate new target date if years is provided
    let targetDate = currentGoal.targetDate;
    if (data.years) {
      targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + data.years);
    }

    // Update the goal
    const updatedGoal = await db.goal.update({
      where: { id: goalId },
      data: {
        name: data.name,
        targetAmt: data.cost,
        targetAmtInflationAdjusted: data.cost ? data.cost * Math.pow(1.06, data.years || 1) : undefined,
        targetDate: targetDate,
        currentAmt: data.upfrontAmount,
        // Update other fields as needed
        monthlyExpenses: data.monthlyExpenses,
        retirementAge: data.retirementAge,
        guestCount: data.guestCount,
        includeHoneymoon: data.includeHoneymoon === "yes",
        monthlyIncome: data.monthlyIncome,
        desiredCoverageMonths: data.desiredCoverageMonths,
        businessType: data.businessType,
        employeeCount: data.employeeCount,
        insuranceCoverage: data.insuranceCoverage,
        familySize: data.familySize,
        donationType: data.donationType,
        recurringAmount: data.recurringAmount,
        debtType: data.debtType,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        customGoalName: data.customGoalName
      }
    });

    revalidatePath("/dashboard/goals");
    return { goal: updatedGoal };
  } catch (error) {
    console.error("Error updating goal:", error);
    throw new Error("Failed to update goal");
  }
}

// Get portfolio analysis
export async function getPortfolioAnalysis() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get all assets with their performance data
    const assets = await db.asset.findMany({
      where: { userId },
      include: {
        performance: {
          orderBy: {
            assetId: 'asc'
          }
        }
      }
    });

    // Calculate total portfolio value
    const totalValue = assets.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);

    // Calculate asset allocation
    const allocation = assets.reduce((acc, asset) => {
      const type = asset.type;
      acc[type] = (acc[type] || 0) + (asset.currentValue || 0);
      return acc;
    }, {} as Record<string, number>);

    // Convert allocation to percentages
    const allocationPercentages = Object.entries(allocation).map(([type, value]) => ({
      type,
      percentage: (value / totalValue) * 100
    }));

    // Calculate risk metrics
    const riskMetrics = {
      high: assets.filter(a => a.risk === 'high').length,
      moderate: assets.filter(a => a.risk === 'moderate').length,
      low: assets.filter(a => a.risk === 'low').length
    };

    return {
      totalValue,
      allocationPercentages,
      riskMetrics
    };
  } catch (error) {
    console.error("Error getting portfolio analysis:", error);
    throw new Error("Failed to get portfolio analysis");
  }
}
