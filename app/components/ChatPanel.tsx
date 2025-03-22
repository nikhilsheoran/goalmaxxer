"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! How can I help you with your financial goals today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'm a demo response for now.",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="h-screen border-l rounded-none bg-background dark:bg-foreground/5 light:bg-foreground/5">
      <div className="px-4 py-3 flex items-center gap-2 bg-background/95 dark:bg-foreground/10 light:bg-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Avatar className="w-6 h-6">
          <AvatarImage src="/images/chad.jpeg" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg font-semibold">Chat with Chad</CardTitle>
      </div>
      <Separator className="dark:border-foreground/10 light:border-foreground/10" />

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <div className="p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "dark:bg-foreground/10 light:bg-foreground/10 dark:text-foreground light:text-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

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
