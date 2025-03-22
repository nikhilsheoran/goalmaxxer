"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { GoalKeyword, GoalPriority, RiskLevel } from "@prisma/client";
import { createGoal } from "@/app/actions/serverActions";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { COMMON_QUESTIONS, GOALS } from "@/app/lib/config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddGoalDialogProps {
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
  onSuccess?: () => void;
}

type Step = "goal-selection" | "goal-specific";

interface GoalData {
  selectedGoal?: string;
  cost?: number;
  years?: number;
  upfrontAmount?: number;
  [key: string]: any;
}

export function AddGoalDialog({
  variant = "default",
  size = "default",
  className,
  onSuccess,
}: AddGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("goal-selection");
  const [currentGoalStep, setCurrentGoalStep] = useState(0);
  const [goalData, setGoalData] = useState<GoalData>({});
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedGoal = GOALS.find((goal) => goal.id === goalData.selectedGoal);
  const currentQuestion = selectedGoal?.questions[currentGoalStep];

  const validateCurrentStep = () => {
    setError("");
    if (!currentQuestion) return true;

    const value = goalData[currentQuestion.id];
    const validation = currentQuestion.validation;

    if (!validation) return true;

    if (validation.required && !value && value !== 0) {
      setError(
        `${currentQuestion.title}: ${
          validation.errorMessage || "This field is required"
        }`
      );
      return false;
    }

    if (validation.min !== undefined && value < validation.min) {
      setError(
        `${currentQuestion.title}: ${
          validation.errorMessage || `Value must be at least ${validation.min}`
        }`
      );
      return false;
    }

    if (validation.max !== undefined && value > validation.max) {
      setError(
        `${currentQuestion.title}: ${
          validation.errorMessage || `Value must be at most ${validation.max}`
        }`
      );
      return false;
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      setError(
        `${currentQuestion.title}: ${
          validation.errorMessage || "Invalid format"
        }`
      );
      return false;
    }

    if (validation.custom && !validation.custom(value)) {
      setError(
        `${currentQuestion.title}: ${
          validation.errorMessage || "Invalid value"
        }`
      );
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setIsLoading(true);
    switch (step) {
      case "goal-selection":
        if (goalData.selectedGoal) {
          setStep("goal-specific");
        } else {
          setError("Please select a goal");
        }
        break;
      case "goal-specific":
        if (validateCurrentStep()) {
          if (
            selectedGoal &&
            currentGoalStep < selectedGoal.questions.length - 1
          ) {
            setCurrentGoalStep(currentGoalStep + 1);
          } else {
            try {
              if (!goalData.selectedGoal) {
                throw new Error("Missing required data");
              }

              await createGoal({
                dateOfBirth: goalData.dateOfBirth || new Date(),
                selectedGoal: goalData.selectedGoal,
                cost: goalData.cost || 0,
                years: goalData.years || 0,
                upfrontAmount: goalData.upfrontAmount || 0,
                ...goalData,
              });

              setOpen(false);
              toast.success("Goal created", {
                description:
                  "Your financial goal has been created successfully.",
              });
              onSuccess?.();
            } catch (error: any) {
              console.error("Error creating goal:", error);
              toast.error("Error creating goal", {
                description: error.message,
              });
            }
          }
        }
        break;
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    if (step === "goal-specific") {
      if (currentGoalStep > 0) {
        setCurrentGoalStep(currentGoalStep - 1);
      } else {
        setStep("goal-selection");
      }
    }
    setError("");
  };

  const handleInputChange = (id: string, value: any) => {
    setGoalData((prev) => ({ ...prev, [id]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const renderQuestion = (question: any) => {
    const value = goalData[question.id];
    const showInfo = question.calculateInfo?.(goalData);

    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.title}</Label>
            <Input
              id={question.id}
              placeholder={question.placeholder}
              value={value || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
          </div>
        );
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.title}</Label>
            <Input
              id={question.id}
              type="number"
              placeholder={question.placeholder}
              value={value ?? ""}
              min={question.validation?.min}
              max={question.validation?.max}
              step={question.validation?.step || 1}
              onChange={(e) =>
                handleInputChange(question.id, parseFloat(e.target.value) || 0)
              }
              onKeyDown={handleKeyDown}
            />
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
            {showInfo && (
              <p className="text-xs text-primary mt-1">{showInfo}</p>
            )}
          </div>
        );
      case "date":
        return (
          <div className="space-y-2">
            <Label>{question.title}</Label>
            <div onKeyDown={handleKeyDown}>
              <CalendarDatePicker
                date={{ from: value || new Date(), to: value || new Date() }}
                numberOfMonths={1}
                onDateSelect={(range) =>
                  handleInputChange(question.id, range.from)
                }
                variant={"outline"}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2" onKeyDown={handleKeyDown}>
            <Label>{question.title}</Label>
            <RadioGroup
              value={value || ""}
              onValueChange={(value) => handleInputChange(question.id, value)}
            >
              {question.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${question.id}-${option.value}`}
                  />
                  <Label htmlFor={`${question.id}-${option.value}`}>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderGoalSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Select a Goal</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Choose what you want to save for
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => {
              setGoalData({ ...goalData, selectedGoal: goal.id });
            }}
            className={cn(
              "p-3 border rounded-xl transition-all duration-200",
              "hover:shadow-md hover:scale-[1.02]",
              "flex flex-col items-center gap-2",
              goalData.selectedGoal === goal.id &&
                "border-primary ring-1 ring-primary bg-primary/5"
            )}
            type="button"
          >
            <div className="text-primary">
              <goal.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium">{goal.name}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGoalSpecificQuestions = () => {
    if (!currentQuestion) return null;

    const showInfo = currentQuestion.calculateInfo?.(goalData);
    const shouldShow = currentQuestion.showWhen?.(goalData) ?? true;

    if (!shouldShow) {
      handleNext();
      return null;
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {selectedGoal?.name}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Step {currentGoalStep + 1} of {selectedGoal?.questions.length}
          </p>
        </div>

        <div className="space-y-4">
          {renderQuestion(currentQuestion)}

          {showInfo && (
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{showInfo}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          // Reset the form when dialog is closed
          setStep("goal-selection");
          setCurrentGoalStep(0);
          setGoalData({ dateOfBirth: new Date() });
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn("gap-2 w-auto", className)}
        >
          <Plus className="h-4 w-4" />{" "}
          {size === "sm" ? "Add Goal" : "Create New Goal"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set up a new financial goal with your target amount and timeline.
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        {step === "goal-specific" && selectedGoal && (
          <div className="h-1 bg-secondary w-full mt-2">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${
                  ((currentGoalStep + 1) / selectedGoal.questions.length) * 100
                }%`,
              }}
            />
          </div>
        )}

        <div className="min-h-[300px]">
          {step === "goal-selection"
            ? renderGoalSelection()
            : renderGoalSpecificQuestions()}
        </div>

        {/* Error message */}
        {error && <p className="text-destructive text-sm">{error}</p>}

        <DialogFooter className="gap-2">
          {step !== "goal-selection" && (
            <Button variant="outline" onClick={handleBack} type="button">
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={isLoading}>
            {step === "goal-specific" &&
            selectedGoal &&
            currentGoalStep === selectedGoal.questions.length - 1
              ? "Create Goal"
              : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
