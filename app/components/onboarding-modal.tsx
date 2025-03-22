"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Home, Umbrella, Car, Plane, GraduationCap, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface UserData {
  name: string;
  dateOfBirth: string;
  selectedGoal: string | null;
}

export default function OnboardingModal() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string>("");
  const [userData, setUserData] = useState<UserData>({
    name: "",
    dateOfBirth: "",
    selectedGoal: null,
  });

  const totalSteps = 3;

  const validateStep = () => {
    setError("");
    switch (step) {
      case 1:
        if (!userData.name.trim()) {
          setError("Please enter your name");
          return false;
        }
        break;
      case 2:
        if (!userData.dateOfBirth) {
          setError("Please enter your date of birth");
          return false;
        }
        // Validate age between 18 and 100 years
        const dob = new Date(userData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18 || age > 100) {
          setError("Age must be between 18 and 100 years");
          return false;
        }
        break;
      case 3:
        if (!userData.selectedGoal) {
          setError("Please select a goal");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">What&apos;s your name?</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Let&apos;s get to know each other better!
              </DialogDescription>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="text-lg p-6"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">When were you born?</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                This helps us personalize your experience.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="date"
              value={userData.dateOfBirth}
              onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })}
              className="text-lg p-6"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {goalOptions.map((goal) => (
                <button
                  key={goal.name}
                  onClick={() => setUserData({ ...userData, selectedGoal: goal.name })}
                  className={`
                    p-6 border rounded-lg hover:shadow-md transition-all duration-200
                    ${userData.selectedGoal === goal.name 
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
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] p-8">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-secondary rounded-full mb-8">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Back Button */}
        {step > 1 && (
          <Button
            variant="ghost"
            className="absolute left-8 top-8"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}

        {/* Step Content */}
        {renderStep()}

        {/* Error Message */}
        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleNext}
            size="lg"
          >
            {step === totalSteps ? "Submit" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
