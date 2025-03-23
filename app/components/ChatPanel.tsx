"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ChevronDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "typescript";
    const isInline = !match && !className?.includes("contains-task-list");
    
    return isInline ? (
      <code className="w-full px-1 py-0.5 rounded-md bg-muted font-mono text-sm" {...props}>
        {children}
      </code>
    ) : (
      <div className="w-full my-2">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  },
  p({ children }) {
    return <p className="mb-2 last:mb-0">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-normal">{children}</li>;
  },
  a({ children, href }) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-4 hover:text-primary/80"
      >
        {children}
      </a>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-primary pl-4 italic my-2">
        {children}
      </blockquote>
    );
  },
};

const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default function ChatPanel() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system",
      content: `I am Chad, your intelligent financial assistant for GoalMaxxer, a goal-based investment platform. My purpose is to help you achieve your financial objectives through smart goal planning and investment management.

## What I Can Do:
- Help set and track financial goals
- Assist with investment management
- Provide portfolio analysis
- Guide through the platform features
- Explain financial concepts
- Use all available tools to help you
- Automatically update dashboard after changes

I maintain a professional focus on GoalMaxxer and your financial goals.

How can I help you with your financial goals today?`,
      role: "system",
    },
    {
      id: "1",
      content: "Hi! How can I help you with your financial goals today?",
      role: "assistant",
    },
  ]);
  const [input, setInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current && contentAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setIsAtBottom(true);
        setAutoScroll(true);
      }
    }
  };
  
  // Check if scrolled to bottom (with a small margin)
  const checkIfAtBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const margin = 50; // 50px margin
        const isBottom = scrollHeight - scrollTop - clientHeight <= margin;
        setIsAtBottom(isBottom);
      }
    }
  };
  
  // Handle scroll events
  const handleScroll = () => {
    checkIfAtBottom();
    // If user scrolls manually, disable auto-scroll
    if (!isAtBottom) {
      setAutoScroll(false);
    }
  };
  
  // Attach scroll event listener
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Auto-scroll when messages change, if enabled
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Re-enable auto-scroll when user sends a message
    setAutoScroll(true);
    // Add a blank assistant message immediately to show loading state
    setMessages(prev => [
      ...prev,
      {
        id: "streaming",
        content: "",
        role: "assistant"
      }
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let accumulatedContent = "";
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Decode the stream chunk
        const chunk = new TextDecoder().decode(value);
        
        // Process each line in the chunk
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const content = line.substring(6);
              if (!content.trim() || content === '[DONE]') continue;
              
              const data = JSON.parse(content);
              if (data.choices && data.choices.length > 0) {
                const content = data.choices[0]?.delta?.content || data.choices[0]?.message?.content;
                if (content) accumulatedContent += content;
              } else if (typeof data === 'string') {
                accumulatedContent += data;
              }
            } catch (e) {
              // If it's not JSON, treat as regular text
              const textData = line.substring(6);
              if (textData && textData !== "[DONE]") {
                accumulatedContent += textData;
              }
            }
          } else {
            // Direct text processing for non-prefixed chunks
            accumulatedContent += chunk;
          }
        }

        // Update the message in state
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant" && lastMessage.content === accumulatedContent) {
            return prev;
          }
          
          return [...prev.filter(m => m.role !== "assistant" || m.id !== "streaming"), {
            id: "streaming",
            content: accumulatedContent,
            role: "assistant"
          }];
        });
      }

      // Once streaming is complete, set the final message with a permanent ID
      setMessages(prev => [
        ...prev.filter(m => m.id !== "streaming"),
        {
          id: Date.now().toString(),
          content: accumulatedContent,
          role: "assistant"
        }
      ]);

    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Sorry, there was an error processing your request.",
        role: "assistant"
      }]);
    }
  };

  return (
    <div className="h-screen border-l rounded-none bg-background dark:bg-foreground/5 light:bg-foreground/5 flex flex-col">
      <div className="px-4 py-3 flex flex-col bg-background/95 dark:bg-foreground/10 light:bg-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold">Chat with Chad</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full p-0"
            onClick={() => setShowDescription(!showDescription)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <AnimatePresence>
          {showDescription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted-foreground mt-1"
            >
              Chad is a new way to interact with GoalMaxxer. It can help you set up your goals, track your progress, and answer questions about GoalMaxxer.
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Quick Action Buttons - Only show when no user messages exist */}
        <AnimatePresence>
          {messages.every(m => m.role !== "user") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput("Show me my portfolio summary");
                  handleSend();
                }}
              >
                📊 Portfolio Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput("What are my current goals?");
                  handleSend();
                }}
              >
                🎯 View Goals
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput("Show my investment performance");
                  handleSend();
                }}
              >
                📈 Investment Performance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput("Give me investment suggestions based on my goals");
                  handleSend();
                }}
              >
                💡 Get Suggestions
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput("Help me create a new financial goal");
                  handleSend();
                }}
              >
                ✨ Create Goal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput("How can I track a new investment?");
                  handleSend();
                }}
              >
                💰 Track Investment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Separator className="dark:border-foreground/10 light:border-foreground/10" />

      <div className="relative flex-1 h-[50px]">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div ref={contentAreaRef} className="p-4 space-y-6">
            {messages.filter(message => message.role !== "system").map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {message.role === "user" ? (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src="/images/chad.jpeg" />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg prose prose-sm dark:prose-invert ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground p-3"
                      : "dark:bg-foreground/10 light:bg-foreground/10 dark:text-foreground light:text-foreground"
                  }`}
                >
                  <MarkdownContent content={message.content} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Scroll to bottom button, visible only when not at bottom */}
        {!isAtBottom && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-6 right-6 rounded-full h-10 w-10 p-0 shadow-md border border-foreground bg-background hover:bg-slate-100"
            variant="secondary"
            size="icon"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator className="dark:border-foreground/10 light:border-foreground/10" />
      <div className="p-4 bg-background/95 dark:bg-foreground/10 light:bg-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            placeholder="Type your message..."
            className="flex-1 dark:bg-background/50 light:bg-background/50 dark:text-foreground light:text-foreground dark:border-foreground/20 light:border-foreground/20"
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="default"
            className="dark:bg-foreground dark:text-background light:bg-foreground light:text-background hover:dark:bg-foreground/90 hover:light:bg-foreground/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
