"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function OnboardingModal() {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to GoalMaxxer! 🎯</DialogTitle>
          <DialogDescription>
            Let&apos;s get you started on your journey to achieving your goals.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the onboarding content. We can add steps,
            forms, or any other content here to help users get started.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
