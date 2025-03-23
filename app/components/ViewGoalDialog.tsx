"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Home, GraduationCap, BadgePercent, Map, Car, Heart, ShieldAlert, BanknoteIcon, Briefcase, Stethoscope, HandHeart, LandmarkIcon, HelpCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { GoalKeyword, GoalPriority } from "@prisma/client";

interface ViewGoalDialogProps {
  goal: {
    id: string;
    name: string;
    description?: string;
    currentAmt: number;
    targetAmt: number;
    targetDate: Date;
    priority: GoalPriority;
    keywords: GoalKeyword[];
  };
}

// Map of category to icon
const categoryIcons = {
  home: Home,
  education: GraduationCap,
  retirement: BadgePercent,
  travel: Map,
  car: Car,
  wedding: Heart,
  emergency_fund: ShieldAlert,
  debt_repayment: BanknoteIcon,
  business: Briefcase,
  health: Stethoscope,
  charity: HandHeart,
  inheritance: LandmarkIcon,
  other: HelpCircle,
};

export function ViewGoalDialog({ goal }: ViewGoalDialogProps) {
  const [open, setOpen] = useState(false);

  // Get the first keyword or default to 'other'
  const category = goal.keywords && goal.keywords.length > 0 ? goal.keywords[0] : 'other';
  
  // Get the icon component for the category
  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Target;
  
  // Calculate remaining amount
  const remainingAmount = goal.targetAmt - goal.currentAmt;
  
  // Calculate progress percentage
  const progressPercentage = Math.floor((goal.currentAmt / goal.targetAmt) * 100);
  
  // Calculate time remaining
  const targetDate = new Date(goal.targetDate);
  const currentDate = new Date();
  const timeDiffDays = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
  const monthsRemaining = Math.floor(timeDiffDays / 30);
  const yearsRemaining = Math.floor(monthsRemaining / 12);
  
  let timeRemainingText = "";
  if (yearsRemaining > 0) {
    timeRemainingText = `${yearsRemaining} year${yearsRemaining !== 1 ? 's' : ''}`;
    if (monthsRemaining % 12 > 0) {
      timeRemainingText += `, ${monthsRemaining % 12} month${monthsRemaining % 12 !== 1 ? 's' : ''}`;
    }
  } else if (monthsRemaining > 0) {
    timeRemainingText = `${monthsRemaining} month${monthsRemaining !== 1 ? 's' : ''}`;
  } else if (timeDiffDays > 0) {
    timeRemainingText = `${timeDiffDays} day${timeDiffDays !== 1 ? 's' : ''}`;
  } else {
    timeRemainingText = "Deadline passed";
  }
  
  // Calculate monthly contribution needed
  const monthlySavingNeeded = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] data-[state=open]:!animate-in data-[state=open]:!fade-in-0 data-[state=open]:!zoom-in-95">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-primary" />
              {goal.name}
            </DialogTitle>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              goal.priority?.toUpperCase() === 'HIGH' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                : goal.priority?.toUpperCase() === 'MEDIUM' 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {goal.priority?.toLowerCase()} priority
            </span>
          </div>
          <DialogDescription>
            {goal.description || "No description provided"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Progress</h4>
            <div className="flex justify-between text-sm mb-1">
              <span>{formatCurrency(goal.currentAmt)}</span>
              <span>{formatCurrency(goal.targetAmt)}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-in-out"
                style={{
                  width: `${Math.min(100, progressPercentage)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="font-medium">{progressPercentage}% complete</span>
              <span className="text-muted-foreground">{formatCurrency(remainingAmount)} remaining</span>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-muted-foreground">Target Date</h4>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(goal.targetDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-muted-foreground">Time Remaining</h4>
              <p>{timeRemainingText}</p>
            </div>
          </div>
          
          {/* Planning Section */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-semibold text-sm text-muted-foreground">Planning</h4>
            <div className="bg-secondary/20 p-4 rounded-lg">
              <p className="text-sm mb-2">To reach your goal in time, you should save:</p>
              <p className="text-lg font-bold">{formatCurrency(monthlySavingNeeded)} per month</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 