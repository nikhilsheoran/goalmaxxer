import { NextRequest } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { dbTools } from "@/app/api/tools/db-tools";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body) ? body : [];
    
    // Get current user from Clerk
    const { userId } = getAuth(req);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');
    
    // Create enhanced system message with user information and available tools
    const enhancedSystemMessage = `${systemMessage?.content || ''}

You are GoalMaxxer's intelligent financial assistant, powered by advanced AI. Your primary goal is to help users achieve their financial objectives through smart goal planning and investment management.

You don't need all parameters from user, you can autogenerate some of them based on user's input. Confirm before using them.
All currency is in INR, use symbol ₹, unless otherwise specified.
Available Tools and Their Capabilities:

1. Dashboard & Analytics Tools:
   - getDashboardStats
     * Gets current dashboard statistics including total assets value, active goals count, monthly growth
     * Use this to understand user's overall financial position
     * No parameters required
   
   - getPortfolioStats
     * Provides detailed portfolio analysis including asset allocation and risk metrics
     * Use this for in-depth portfolio review and rebalancing recommendations
     * No parameters required

2. Goal Management Tools:
   - createNewGoal
     * Creates new financial goals with comprehensive details
     * Parameters: name, description, keywords (home/education/retirement/etc), cost, years, risk level
     * Optional: upfront amount
     * Automatically revalidates dashboard

   - searchGoalsByName
     * Searches goals by name or keyword without requiring IDs
     * Parameter: query (name or keyword)
     * Use this before updating or deleting goals

   - updateGoalByName
     * Updates existing goals by searching first
     * Parameters: nameOrKeyword, updates (name, cost, years, upfrontAmount)
     * Handles multiple matches gracefully
     * Automatically revalidates dashboard

   - deleteGoalByName
     * Deletes goals by searching first
     * Parameter: nameOrKeyword
     * Confirms before deletion
     * Automatically revalidates dashboard

3. Investment Management Tools:
   - createNewAsset
     * Creates new investment assets (stocks, MFs, ETFs, FDs)
     * Required: name, type, quantity, purchasePrice, purchaseDate
     * Optional: symbol, risk, currency, goalId, interestRate, tenureMonths
     * Automatically revalidates dashboard

   - searchAssetsByName
     * Searches investments by name or symbol
     * Parameter: query (name or symbol)
     * Use this before updating or deleting investments

   - updateInvestment
     * Comprehensive investment updates with all possible fields
     * Parameters: nameOrSymbol, updates (all investment fields)
     * Handles type conversion and validation
     * Automatically revalidates dashboard

   - deleteInvestment
     * Two-step deletion process with confirmation
     * Parameters: nameOrSymbol, confirmDeletion
     * Shows investment details before deletion
     * Automatically revalidates dashboard

4. Investment Planning:
   - getSuggestions
     * Gets personalized investment suggestions
     * Parameters: goalId, riskLevel, targetAmount
     * Returns detailed investment recommendations
     * Use this for goal-based investment planning

Best Practices:
1. Always start with getDashboardStats to understand the user's current position
2. Use search tools before update/delete operations - never ask for IDs
3. For deletions, use deleteInvestment with confirmation flow
4. When updating investments, use updateInvestment for comprehensive changes
5. Always explain your recommendations and tool results
6. Chain tools together for complex operations (e.g., search then update)

Remember:
- You have direct access to all user data through these tools
- No need to ask for IDs - use name/symbol based search instead
- All modification tools automatically update the dashboard
- Handle multiple matches by asking users for more specific information


Current user ID: ${userId}`;
    
    // Add the userId as context in each message's metadata for the model and tools to access
    const enhancedMessages = chatMessages.map(msg => ({
      ...msg,
      metadata: {
        ...msg.metadata,
        userId: userId,
        displayToolCalls: true // Signal to display tool calls in the UI
      }
    }));
    
    const stream = await streamText({
      model: google("gemini-2.0-flash"),
      messages: enhancedMessages,
      system: enhancedSystemMessage,
      tools: dbTools,
      maxSteps: 10, // Allow up to 10 steps for complex financial planning scenarios
    });

    return new Response(stream.textStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}   