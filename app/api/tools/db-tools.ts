import { z } from 'zod';
import { tool } from 'ai';
import { db } from '@/lib/prisma';
import { GoalKeyword, GoalPriority } from '@prisma/client';

// Helper function to extract userId from tool execution context
const getUserIdFromContext = (options: any) => {
  // Try to extract userId from messages metadata
  if (options?.messages?.length > 0) {
    // Look through messages to find one with userId metadata
    for (const message of options.messages) {
      if (message?.metadata?.userId) {
        return message.metadata.userId;
      }
    }
  }
  return null;
};

// Get User Profile tool
export const getUserProfile = tool({
  description: 'Get the current user profile',
  parameters: z.object({}), // No parameters needed
  execute: async (_args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          goals: true,
          Asset: {
            include: {
              stockDetails: true,
              mfDetails: true,
              fdDetails: true,
              etfDetails: true,
              performance: true,
            }
          }
        }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: 'Failed to fetch user profile' };
    }
  },
});

// List User Goals tool
export const listUserGoals = tool({
  description: 'List all goals for the current user',
  parameters: z.object({}), // No parameters needed
  execute: async (_args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const goals = await db.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return { success: true, goals };
    } catch (error) {
      console.error('Error listing user goals:', error);
      return { success: false, error: 'Failed to list user goals' };
    }
  },
});

// Create Goal tool
export const createGoal = tool({
  description: 'Create a new financial goal for the current user',
  parameters: z.object({
    name: z.string().describe('Goal name'),
    description: z.string().describe('Goal description'),
    keywords: z.array(z.string()).describe('Goal keywords (home, education, retirement, travel, car, wedding, emergency_fund, debt_repayment, business, health, charity, inheritance, other)'),
    currentAmt: z.number().describe('Current amount saved towards goal'),
    targetAmt: z.number().describe('Target amount for the goal'),
    targetDate: z.string().describe('Target date for the goal (ISO format)'),
    priority: z.enum(['high', 'medium', 'low']).describe('Goal priority'),
  }),
  execute: async (args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const { name, description, keywords, currentAmt, targetAmt, targetDate, priority } = args;
      
      // Convert keyword strings to GoalKeyword enum values
      const goalKeywords = keywords.map(keyword => {
        // Replace spaces with underscores and convert to lowercase
        const formattedKeyword = keyword.toLowerCase().replace(/\s+/g, '_');
        return formattedKeyword as GoalKeyword;
      });

      const newGoal = await db.goal.create({
        data: {
          userId,
          name,
          description,
          keywords: goalKeywords,
          currentAmt,
          targetAmt,
          targetAmtInflationAdjusted: targetAmt * 1.05, // Simple inflation adjustment
          targetDate: new Date(targetDate),
          priority: priority as GoalPriority,
        },
      });

      return { success: true, goal: newGoal };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { success: false, error: 'Failed to create goal' };
    }
  },
});

// Update Goal tool
export const updateGoal = tool({
  description: 'Update an existing financial goal',
  parameters: z.object({
    goalId: z.string().describe('Goal ID'),
    name: z.string().optional().describe('Goal name'),
    description: z.string().optional().describe('Goal description'),
    keywords: z.array(z.string()).optional().describe('Goal keywords (home, education, retirement, travel, car, wedding, emergency_fund, debt_repayment, business, health, charity, inheritance, other)'),
    currentAmt: z.number().optional().describe('Current amount saved towards goal'),
    targetAmt: z.number().optional().describe('Target amount for the goal'),
    targetDate: z.string().optional().describe('Target date for the goal (ISO format)'),
    priority: z.enum(['high', 'medium', 'low']).optional().describe('Goal priority'),
  }),
  execute: async (args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const { goalId, ...data } = args;
      
      // Make sure the goal belongs to the current user
      const goalExists = await db.goal.findFirst({
        where: { 
          id: goalId,
          userId: userId
        },
      });

      if (!goalExists) {
        return { success: false, error: 'Goal not found or not owned by the current user' };
      }

      // Process data for update
      const updateData: any = { ...data };
      
      // Convert targetDate string to Date object if provided
      if (data.targetDate) {
        updateData.targetDate = new Date(data.targetDate);
      }

      // Convert keyword strings to GoalKeyword enum values if provided
      if (data.keywords) {
        updateData.keywords = data.keywords.map(keyword => {
          const formattedKeyword = keyword.toLowerCase().replace(/\s+/g, '_');
          return formattedKeyword as GoalKeyword;
        });
      }

      // Convert priority to GoalPriority enum if provided
      if (data.priority) {
        updateData.priority = data.priority as GoalPriority;
      }

      // Update targetAmtInflationAdjusted if targetAmt is provided
      if (data.targetAmt) {
        updateData.targetAmtInflationAdjusted = data.targetAmt * 1.05;
      }

      const updatedGoal = await db.goal.update({
        where: { id: goalId },
        data: updateData,
      });

      return { success: true, goal: updatedGoal };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { success: false, error: 'Failed to update goal' };
    }
  },
});

// Delete Goal tool
export const deleteGoal = tool({
  description: 'Delete a financial goal',
  parameters: z.object({
    goalId: z.string().describe('Goal ID'),
  }),
  execute: async (args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const { goalId } = args;
      
      // Make sure the goal belongs to the current user
      const goalExists = await db.goal.findFirst({
        where: { 
          id: goalId,
          userId: userId
        },
      });

      if (!goalExists) {
        return { success: false, error: 'Goal not found or not owned by the current user' };
      }

      await db.goal.delete({
        where: { id: goalId },
      });

      return { success: true, message: 'Goal deleted successfully' };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error: 'Failed to delete goal' };
    }
  },
});

// List Assets tool
export const listUserAssets = tool({
  description: 'List all assets for the current user',
  parameters: z.object({}), // No parameters needed
  execute: async (_args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const assets = await db.asset.findMany({
        where: { userId },
        include: {
          stockDetails: true,
          mfDetails: true,
          fdDetails: true,
          etfDetails: true,
          performance: true,
        },
        orderBy: { purchaseDate: 'desc' },
      });

      return { success: true, assets };
    } catch (error) {
      console.error('Error listing user assets:', error);
      return { success: false, error: 'Failed to list user assets' };
    }
  },
});

// Calculate Goal Progress tool
export const calculateGoalProgress = tool({
  description: 'Calculate the progress towards a specific goal',
  parameters: z.object({
    goalId: z.string().describe('Goal ID'),
  }),
  execute: async (args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const { goalId } = args;
      
      // Make sure the goal belongs to the current user
      const goal = await db.goal.findFirst({
        where: { 
          id: goalId,
          userId: userId
        },
      });

      if (!goal) {
        return { success: false, error: 'Goal not found or not owned by the current user' };
      }

      const percentComplete = (goal.currentAmt / goal.targetAmt) * 100;
      const remainingAmount = goal.targetAmt - goal.currentAmt;
      
      // Calculate time remaining
      const now = new Date();
      const targetDate = new Date(goal.targetDate);
      const timeRemainingMs = targetDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));
      
      // Calculate required monthly saving
      const monthsRemaining = daysRemaining / 30;
      const requiredMonthlySaving = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;

      return {
        success: true,
        goal: goal.name,
        percentComplete: Math.min(100, Math.max(0, percentComplete)),
        currentAmount: goal.currentAmt,
        targetAmount: goal.targetAmt,
        remainingAmount,
        daysRemaining: Math.max(0, daysRemaining),
        requiredMonthlySaving: monthsRemaining > 0 ? requiredMonthlySaving : null,
        isCompleted: goal.completedDate !== null,
      };
    } catch (error) {
      console.error('Error calculating goal progress:', error);
      return { success: false, error: 'Failed to calculate goal progress' };
    }
  },
});

// Mark Goal as Complete tool
export const completeGoal = tool({
  description: 'Mark a goal as completed',
  parameters: z.object({
    goalId: z.string().describe('Goal ID'),
  }),
  execute: async (args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const { goalId } = args;
      
      // Make sure the goal belongs to the current user
      const goal = await db.goal.findFirst({
        where: { 
          id: goalId,
          userId: userId
        },
      });

      if (!goal) {
        return { success: false, error: 'Goal not found or not owned by the current user' };
      }

      const updatedGoal = await db.goal.update({
        where: { id: goalId },
        data: { completedDate: new Date() },
      });

      return { success: true, goal: updatedGoal };
    } catch (error) {
      console.error('Error completing goal:', error);
      return { success: false, error: 'Failed to complete goal' };
    }
  },
});

// Get Asset Performance tool
export const getAssetPerformance = tool({
  description: 'Get performance data for a specific asset',
  parameters: z.object({
    assetId: z.string().describe('Asset ID'),
  }),
  execute: async (args, options) => {
    try {
      // Extract userId from context
      const userId = getUserIdFromContext(options);
      
      if (!userId) {
        return { success: false, error: 'User ID not available' };
      }
      
      const { assetId } = args;
      
      // Make sure the asset belongs to the current user
      const asset = await db.asset.findFirst({
        where: { 
          id: assetId,
          userId: userId
        },
        include: {
          performance: true,
        },
      });

      if (!asset) {
        return { success: false, error: 'Asset not found or not owned by the current user' };
      }

      return { success: true, asset, performance: asset.performance };
    } catch (error) {
      console.error('Error getting asset performance:', error);
      return { success: false, error: 'Failed to get asset performance' };
    }
  },
});

// Export all tools
export const dbTools = {
  getUserProfile,
  listUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  listUserAssets,
  calculateGoalProgress,
  completeGoal,
  getAssetPerformance,
}; 