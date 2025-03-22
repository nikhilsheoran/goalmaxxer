"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { GoalKeyword, GoalPriority } from "@prisma/client";
import { createGoal } from "@/app/actions/serverActions";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";

interface AddGoalDialogProps {
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
  onSuccess?: () => void;
}

export function AddGoalDialog({ variant = "default", size = "default", className, onSuccess }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const goalData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        currentAmt: parseFloat(formData.get("currentAmt") as string),
        targetAmt: parseFloat(formData.get("targetAmt") as string),
        targetDate: date ?? new Date(),
        priority: formData.get("priority") as GoalPriority,
        keywords: [formData.get("keyword") as GoalKeyword],
      };

      await createGoal(goalData);
      setOpen(false);
      toast({
        title: "Goal created",
        description: "Your financial goal has been created successfully.",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className={cn("gap-2 w-auto", className)}>
          <Plus className="h-4 w-4" /> {size === "sm" ? "Add Goal" : "Create New Goal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] data-[state=open]:!animate-in data-[state=open]:!fade-in-0 data-[state=open]:!zoom-in-95">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Create New Goal</DialogTitle>
            <div className="min-w-[120px]">
              <Select name="priority" required defaultValue="medium">
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high" className="text-red-600">High</SelectItem>
                  <SelectItem value="medium" className="text-yellow-600">Medium</SelectItem>
                  <SelectItem value="low" className="text-blue-600">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogDescription>
            Set up a new financial goal with your target amount and timeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Buy a House"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of your goal"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAmt">Current Amount</Label>
                <Input
                  id="currentAmt"
                  name="currentAmt"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmt">Target Amount</Label>
                <Input
                  id="targetAmt"
                  name="targetAmt"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Date</Label>
              <CalendarDatePicker
                date={{ from: date ?? new Date(), to: date ?? new Date() }}
                numberOfMonths={1}
                onDateSelect={(range) => setDate(range.from)}
                variant={"outline"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyword">Category</Label>
              <Select name="keyword" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                  <SelectItem value="debt_repayment">Debt Repayment</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="charity">Charity</SelectItem>
                  <SelectItem value="inheritance">Inheritance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Create Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 