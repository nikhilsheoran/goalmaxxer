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
    
    // Create enhanced system message with user information
    const enhancedSystemMessage = systemMessage?.content + `\n\nCurrent user ID: ${userId}`;
    
    // Add the userId as context in each message's metadata for the model and tools to access
    const enhancedMessages = chatMessages.map(msg => ({
      ...msg,
      metadata: {
        ...msg.metadata,
        userId: userId
      }
    }));
    
    const stream = await streamText({
      model: google("gemini-2.0-flash"),
      messages: enhancedMessages,
      system: enhancedSystemMessage || undefined,
      tools: dbTools,
      maxSteps: 3, // Allow up to 3 steps for tool calls
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