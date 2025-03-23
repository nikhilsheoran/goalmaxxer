import { z } from 'zod';
import { tool } from 'ai';
import { 
  getDashboardData, 
  createGoal,
  completeOnboarding,
  getInvestmentSuggestions,
  createAsset,
  searchAssets,
  deleteAsset,
  updateAsset,
  searchGoals,
  deleteGoal,
  updateGoal,
  getPortfolioAnalysis,
  type GoalData,
  type OnboardingData,
  type AssetData
} from '@/app/actions/serverActions';
import { GoalKeyword, GoalPriority, AssetType, RiskLevel } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Helper function to extract userId from tool execution context
const getUserIdFromContext = (options: any) => {
  if (options?.messages?.length > 0) {
    for (const message of options.messages) {
      if (message?.metadata?.userId) {
        return message.metadata.userId;
      }
    }
  }
  return null;
};

// Get Dashboard Data tool
export const getDashboardStats = tool({
  description: 'Get the current user dashboard statistics including total assets value, active goals count, and monthly growth',
  parameters: z.object({}),
  execute: async (_args, options) => {
    try {
      const data = await getDashboardData();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { success: false, error: 'Failed to fetch dashboard data' };
    }
  },
});

// Create Goal tool
export const createNewGoal = tool({
  description: 'Create a new financial goal for the current user',
  parameters: z.object({
    name: z.string().describe('Goal name'),
    description: z.string().describe('Goal description'),
    keywords: z.array(z.enum(['home', 'education', 'retirement', 'travel', 'car', 'wedding', 'emergency_fund', 'debt_repayment', 'business', 'health', 'charity', 'inheritance', 'other'])).describe('Goal keywords'),
    cost: z.number().describe('Target cost/amount for the goal'),
    years: z.number().describe('Number of years to achieve the goal'),
    upfrontAmount: z.number().optional().describe('Initial amount to put towards the goal'),
    riskLevel: z.enum(['High', 'Medium', 'Low']).describe('Risk level for the goal'),
  }),
  execute: async (args, options) => {
    try {
      const goalData: OnboardingData = {
        ...args,
        selectedGoal: args.keywords[0], // Use first keyword as main goal type
        dateOfBirth: new Date(), // This will be overridden by the actual user's DOB
        cost: args.cost,
        years: args.years,
        upfrontAmount: args.upfrontAmount,
      };
      
      const goal = await completeOnboarding(goalData);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/goals');
      return { success: true, goal };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { success: false, error: 'Failed to create goal' };
    }
  },
});

// Get Investment Suggestions tool
export const getSuggestions = tool({
  description: 'Get investment suggestions for a goal based on risk level and target amount',
  parameters: z.object({
    goalId: z.string().describe('Goal ID'),
    riskLevel: z.enum(['High', 'Medium', 'Low']).describe('Risk level for investments'),
    targetAmount: z.number().describe('Target amount for investments'),
  }),
  execute: async (args, options) => {
    try {
      const suggestions = await getInvestmentSuggestions({
        riskLevel: args.riskLevel,
        cost: args.targetAmount,
        years: 5, // Default to 5 years if not specified
        selectedGoal: args.goalId,
      });
      
      return { success: true, suggestions };
    } catch (error) {
      console.error('Error getting investment suggestions:', error);
      return { success: false, error: 'Failed to get investment suggestions' };
    }
  },
});

// Create Asset tool
export const createNewAsset = tool({
  description: 'Create a new investment asset',
  parameters: z.object({
    name: z.string().describe('Asset name'),
    type: z.enum(['stock', 'mf', 'etf', 'fd']).describe('Asset type'),
    symbol: z.string().optional().describe('Asset symbol (for stocks, MFs, ETFs)'),
    quantity: z.number().describe('Quantity of the asset'),
    purchasePrice: z.number().describe('Purchase price per unit'),
    purchaseDate: z.string().describe('Purchase date (ISO format)'),
    risk: z.enum(['high', 'moderate', 'low']).optional().describe('Risk level of the asset'),
    currency: z.string().describe('Currency of the asset'),
    goalId: z.string().optional().describe('Associated goal ID'),
    institution: z.string().optional().describe('Financial institution'),
    interestRate: z.number().optional().describe('Interest rate (for FDs)'),
    tenureMonths: z.number().optional().describe('Tenure in months (for FDs)'),
  }),
  execute: async (args, options) => {
    try {
      const assetData: AssetData = {
        ...args,
        purchaseDate: new Date(args.purchaseDate),
        type: args.type as AssetType,
        risk: args.risk as RiskLevel | undefined,
      };
      
      const asset = await createAsset(assetData);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/investments');
      return { success: true, asset };
    } catch (error) {
      console.error('Error creating asset:', error);
      return { success: false, error: 'Failed to create asset' };
    }
  },
});

// Search Assets tool
export const searchAssetsByName = tool({
  description: 'Search for assets by name or symbol. Use this to find assets without needing their IDs.',
  parameters: z.object({
    query: z.string().describe('Search query (asset name or symbol)'),
  }),
  execute: async (args, options) => {
    try {
      const result = await searchAssets(args.query);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error searching assets:', error);
      return { success: false, error: 'Failed to search assets' };
    }
  },
});

// Delete Asset tool
export const deleteAssetByName = tool({
  description: 'Delete an asset by searching for it first. Use this instead of requiring an asset ID.',
  parameters: z.object({
    nameOrSymbol: z.string().describe('Asset name or symbol to delete'),
  }),
  execute: async (args, options) => {
    try {
      // First search for the asset
      const searchResult = await searchAssets(args.nameOrSymbol);
      if (!searchResult.assets || searchResult.assets.length === 0) {
        return { success: false, error: 'Asset not found' };
      }
      if (searchResult.assets.length > 1) {
        return { 
          success: false, 
          error: 'Multiple assets found. Please be more specific.',
          assets: searchResult.assets.map(a => ({ name: a.name, symbol: a.symbol }))
        };
      }
      
      // Delete the found asset
      await deleteAsset(searchResult.assets[0].id);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/investments');
      return { success: true, message: `Asset "${searchResult.assets[0].name}" deleted successfully` };
    } catch (error) {
      console.error('Error deleting asset:', error);
      return { success: false, error: 'Failed to delete asset' };
    }
  },
});

// Update Asset tool
export const updateAssetByName = tool({
  description: 'Update an asset by searching for it first. Use this instead of requiring an asset ID.',
  parameters: z.object({
    nameOrSymbol: z.string().describe('Current asset name or symbol to update'),
    updates: z.object({
      name: z.string().optional().describe('New asset name'),
      symbol: z.string().optional().describe('New symbol'),
      quantity: z.number().optional().describe('New quantity'),
      purchasePrice: z.number().optional().describe('New purchase price'),
      risk: z.enum(['high', 'moderate', 'low']).optional().describe('New risk level'),
    }).describe('Fields to update'),
  }),
  execute: async (args, options) => {
    try {
      // First search for the asset
      const searchResult = await searchAssets(args.nameOrSymbol);
      if (!searchResult.assets || searchResult.assets.length === 0) {
        return { success: false, error: 'Asset not found' };
      }
      if (searchResult.assets.length > 1) {
        return { 
          success: false, 
          error: 'Multiple assets found. Please be more specific.',
          assets: searchResult.assets.map(a => ({ name: a.name, symbol: a.symbol }))
        };
      }
      
      // Update the found asset
      const result = await updateAsset(searchResult.assets[0].id, args.updates);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/investments');
      return { success: true, asset: result.asset };
    } catch (error) {
      console.error('Error updating asset:', error);
      return { success: false, error: 'Failed to update asset' };
    }
  },
});

// Search Goals tool
export const searchGoalsByName = tool({
  description: 'Search for goals by name or keyword. Use this to find goals without needing their IDs.',
  parameters: z.object({
    query: z.string().describe('Search query (goal name or keyword)'),
  }),
  execute: async (args, options) => {
    try {
      const result = await searchGoals(args.query);
      return { success: true, ...result };
    } catch (error) {
      console.error('Error searching goals:', error);
      return { success: false, error: 'Failed to search goals' };
    }
  },
});

// Delete Goal tool
export const deleteGoalByName = tool({
  description: 'Delete a goal by searching for it first. Use this instead of requiring a goal ID.',
  parameters: z.object({
    nameOrKeyword: z.string().describe('Goal name or keyword to delete'),
  }),
  execute: async (args, options) => {
    try {
      // First search for the goal
      const searchResult = await searchGoals(args.nameOrKeyword);
      if (!searchResult.goals || searchResult.goals.length === 0) {
        return { success: false, error: 'Goal not found' };
      }
      if (searchResult.goals.length > 1) {
        return { 
          success: false, 
          error: 'Multiple goals found. Please be more specific.',
          goals: searchResult.goals.map(g => ({ name: g.name }))
        };
      }
      
      // Delete the found goal
      await deleteGoal(searchResult.goals[0].id);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/goals');
      return { success: true, message: `Goal "${searchResult.goals[0].name}" deleted successfully` };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error: 'Failed to delete goal' };
    }
  },
});

// Update Goal tool
export const updateGoalByName = tool({
  description: 'Update a goal by searching for it first. Use this instead of requiring a goal ID.',
  parameters: z.object({
    nameOrKeyword: z.string().describe('Current goal name or keyword to update'),
    updates: z.object({
      name: z.string().optional().describe('New goal name'),
      cost: z.number().optional().describe('New target amount'),
      years: z.number().optional().describe('New number of years'),
      upfrontAmount: z.number().optional().describe('New upfront amount'),
    }).describe('Fields to update'),
  }),
  execute: async (args, options) => {
    try {
      // First search for the goal
      const searchResult = await searchGoals(args.nameOrKeyword);
      if (!searchResult.goals || searchResult.goals.length === 0) {
        return { success: false, error: 'Goal not found' };
      }
      if (searchResult.goals.length > 1) {
        return { 
          success: false, 
          error: 'Multiple goals found. Please be more specific.',
          goals: searchResult.goals.map(g => ({ name: g.name }))
        };
      }
      
      // Update the found goal
      const result = await updateGoal(searchResult.goals[0].id, args.updates);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/goals');
      return { success: true, goal: result.goal };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { success: false, error: 'Failed to update goal' };
    }
  },
});

// Get Portfolio Analysis tool
export const getPortfolioStats = tool({
  description: 'Get detailed portfolio analysis including asset allocation and risk metrics.',
  parameters: z.object({}),
  execute: async (_args, options) => {
    try {
      const analysis = await getPortfolioAnalysis();
      return { success: true, ...analysis };
    } catch (error) {
      console.error('Error getting portfolio analysis:', error);
      return { success: false, error: 'Failed to get portfolio analysis' };
    }
  },
});

// Update Investment tool with comprehensive fields
export const updateInvestment = tool({
  description: 'Update an investment with comprehensive fields. Use this for detailed investment updates.',
  parameters: z.object({
    nameOrSymbol: z.string().describe('Current investment name or symbol to update'),
    updates: z.object({
      name: z.string().optional().describe('New investment name'),
      symbol: z.string().optional().describe('New symbol'),
      type: z.enum(['stock', 'mf', 'etf', 'fd']).optional().describe('New investment type'),
      quantity: z.number().optional().describe('New quantity'),
      purchasePrice: z.number().optional().describe('New purchase price per unit'),
      purchaseDate: z.string().optional().describe('New purchase date (ISO format)'),
      risk: z.enum(['high', 'moderate', 'low']).optional().describe('New risk level'),
      currency: z.string().optional().describe('New currency'),
      goalId: z.string().optional().describe('New associated goal ID'),
      interestRate: z.number().optional().describe('New interest rate (for FDs)'),
      tenureMonths: z.number().optional().describe('New tenure in months (for FDs)'),
    }).describe('Fields to update'),
  }),
  execute: async (args, options) => {
    try {
      // First search for the investment
      const searchResult = await searchAssets(args.nameOrSymbol);
      if (!searchResult.assets || searchResult.assets.length === 0) {
        return { success: false, error: 'Investment not found' };
      }
      if (searchResult.assets.length > 1) {
        return { 
          success: false, 
          error: 'Multiple investments found. Please be more specific.',
          investments: searchResult.assets.map(a => ({ 
            name: a.name, 
            symbol: a.symbol,
            type: a.type
          }))
        };
      }
      
      // Process updates
      const { purchaseDate, type, risk, ...otherUpdates } = args.updates;
      const updates: Partial<AssetData> = {
        ...otherUpdates,
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
        ...(type && { type: type as AssetType }),
        ...(risk && { risk: risk as RiskLevel })
      };
      
      // Update the investment
      const result = await updateAsset(searchResult.assets[0].id, updates);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/investments');
      return { 
        success: true, 
        message: `Investment "${searchResult.assets[0].name}" updated successfully`,
        investment: result.asset 
      };
    } catch (error) {
      console.error('Error updating investment:', error);
      return { success: false, error: 'Failed to update investment' };
    }
  },
});

// Delete Investment tool with confirmation
export const deleteInvestment = tool({
  description: 'Delete an investment by name or symbol, with confirmation of details before deletion.',
  parameters: z.object({
    nameOrSymbol: z.string().describe('Investment name or symbol to delete'),
    confirmDeletion: z.boolean().describe('Confirm deletion after seeing investment details'),
  }),
  execute: async (args, options) => {
    try {
      // First search for the investment
      const searchResult = await searchAssets(args.nameOrSymbol);
      if (!searchResult.assets || searchResult.assets.length === 0) {
        return { success: false, error: 'Investment not found' };
      }
      if (searchResult.assets.length > 1) {
        return { 
          success: false, 
          error: 'Multiple investments found. Please be more specific.',
          investments: searchResult.assets.map(a => ({ 
            name: a.name, 
            symbol: a.symbol,
            type: a.type,
            quantity: a.quantity,
            purchasePrice: a.purchasePrice
          }))
        };
      }

      const investment = searchResult.assets[0];
      
      // If not confirmed, return investment details for confirmation
      if (!args.confirmDeletion) {
        return {
          success: false,
          error: 'Please confirm deletion',
          investmentDetails: {
            name: investment.name,
            symbol: investment.symbol,
            type: investment.type,
            quantity: investment.quantity,
            purchasePrice: investment.purchasePrice,
            purchaseDate: investment.purchaseDate,
            totalValue: investment.quantity * investment.purchasePrice
          }
        };
      }
      
      // Delete the investment
      await deleteAsset(investment.id);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/investments');
      return { 
        success: true, 
        message: `Investment "${investment.name}" deleted successfully`,
        deletedInvestment: {
          name: investment.name,
          symbol: investment.symbol,
          type: investment.type,
          totalValue: investment.quantity * investment.purchasePrice
        }
      };
    } catch (error) {
      console.error('Error deleting investment:', error);
      return { success: false, error: 'Failed to delete investment' };
    }
  },
});

// Export all tools
export const dbTools = {
  getDashboardStats,
  createNewGoal,
  getSuggestions,
  createNewAsset,
  searchAssetsByName,
  deleteAssetByName,
  updateAssetByName,
  searchGoalsByName,
  deleteGoalByName,
  updateGoalByName,
  getPortfolioStats,
  updateInvestment,
  deleteInvestment,
}; 