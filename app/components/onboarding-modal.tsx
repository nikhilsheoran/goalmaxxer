"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Home, Umbrella, Car, Plane, GraduationCap, Plus } from "lucide-react";
import { useState } from "react";

interface GoalOption {
  icon: React.ReactNode;
  name: string;
}

const goalOptions: GoalOption[] = [
  { icon: <Home className="h-10 w-10" />, name: "Own Home" },
  { icon: <Umbrella className="h-10 w-10" />, name: "Retire Easy" },
  { icon: <Car className="h-10 w-10" />, name: "Buy Car" },
  { icon: <Plane className="h-10 w-10" />, name: "Vacation" },
  { icon: <GraduationCap className="h-10 w-10" />, name: "Educate Child" },
  { icon: <Plus className="h-10 w-10" />, name: "Create Own" },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-bold tracking-tight">Set your Goal</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            We&apos;ll help you bring your dreams to life!
          </DialogDescription>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Setting a financial goal is the first step to making your dreams a reality.
            Investing regularly is the next. We make it really simple for you, and we&apos;re with
            you every step of the way. Simply choose your goal to get started.
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
          {goalOptions.map((goal) => (
            <button
              key={goal.name}
              onClick={() => setSelectedGoal(goal.name)}
              className={`
                p-6 border rounded-lg hover:shadow-md transition-all duration-200
                ${selectedGoal === goal.name 
                  ? 'border-primary ring-2 ring-primary bg-primary/5' 
                  : 'hover:border-primary/50 hover:bg-primary/5'
                }
              `}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center text-primary p-2">
                  {goal.icon}
                </div>
                <p className="text-center font-medium text-sm">{goal.name}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
