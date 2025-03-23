"use client";

import { useState, useEffect } from "react";
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
import { createGoal, createAsset, GoalData } from "@/app/actions/serverActions";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { COMMON_QUESTIONS, GOALS } from "@/app/lib/config";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InvestmentSuggestions } from "./InvestmentSuggestions";

interface AddGoalDialogProps {
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
  onSuccess?: () => void;
}

type Step = "goal-selection" | "goal-specific" | "investment-suggestions";

interface LocalGoalData extends GoalData {
  dateOfBirth?: Date;
  [key: string]: string | number | Date | boolean | undefined;
}

type QuestionValue = string | number | Date | boolean;
type QuestionType = 'text' | 'number' | 'date' | 'radio' | 'custom';
type OptionValue = string | number;

interface Question {
  id: string;
  title: string;
  type: QuestionType;
  placeholder?: string;
  description?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    pattern?: RegExp;
    errorMessage?: string;
    custom?: (value: QuestionValue) => boolean;
  };
  calculateInfo?: (data: LocalGoalData) => string | undefined | null;
  showWhen?: (data: LocalGoalData) => boolean;
  options?: Array<{ value: OptionValue; label: string }>;
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
  const [goalData, setGoalData] = useState<LocalGoalData>({
    cost: 0,
    years: 0,
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedGoal = GOALS.find((goal) => goal.id === goalData.selectedGoal);
  const currentQuestion = selectedGoal?.questions[currentGoalStep];

  useEffect(() => {
    if (step === "goal-specific" && currentQuestion) {
      const shouldShow = currentQuestion.showWhen?.(goalData) ?? true;
      if (!shouldShow) {
        skipToNextQuestion();
      }
    }
  }, [currentQuestion, goalData, step]);

  const skipToNextQuestion = () => {
    if (selectedGoal && currentGoalStep < selectedGoal.questions.length - 1) {
      setCurrentGoalStep(currentGoalStep + 1);
    } else {
      moveToInvestmentSuggestions();
    }
  };

  const moveToInvestmentSuggestions = () => {
    if (!goalData.selectedGoal) {
      setError("Missing required data");
      return;
    }
    setStep("investment-suggestions");
  };

  const handleCreateGoalWithInvestments = async (investments: any[] | null) => {
    try {
      setIsLoading(true);
      

      // Ensure priority is set
      const priority = goalData.priority || "medium" as GoalPriority;
      // Calculate target amount for emergency fund
      let targetAmount = goalData.cost;
      if (goalData.selectedGoal === "emergencyFund" && goalData.monthlyIncome && goalData.desiredCoverageMonths) {
        targetAmount = goalData.monthlyIncome * goalData.desiredCoverageMonths;
      }
      
      // First create the goal
      const goal = await createGoal({
        dateOfBirth: goalData.dateOfBirth || new Date(),
        selectedGoal: goalData.selectedGoal || "",
        cost: targetAmount, // Use the calculated target amount
        years: goalData.years,
        upfrontAmount: goalData.upfrontAmount || 0,
        priority: priority,
        // Only spread additional fields, not the ones we've already specified
        takingLoan: goalData.takingLoan,
        downPaymentPercentage: goalData.downPaymentPercentage,
        riskLevel: goalData.riskLevel,
        monthlyExpenses: goalData.monthlyExpenses,
        retirementAge: goalData.retirementAge,
        guestCount: goalData.guestCount,
        includeHoneymoon: goalData.includeHoneymoon,
        monthlyIncome: goalData.monthlyIncome,
        desiredCoverageMonths: goalData.desiredCoverageMonths,
        businessType: goalData.businessType,
        employeeCount: goalData.employeeCount,
        insuranceCoverage: goalData.insuranceCoverage,
        familySize: goalData.familySize,
        donationType: goalData.donationType,
        recurringAmount: goalData.recurringAmount,
        debtType: goalData.debtType,
        interestRate: goalData.interestRate,
        minimumPayment: goalData.minimumPayment,
        customGoalName: goalData.customGoalName,
      });

      // If investments are provided, create them
      if (investments && investments.length > 0) {
        for (const investment of investments) {
          await createAsset({
            ...investment,
            purchaseDate: new Date(),
            goalId: goal.id,
          });
        }
      }

      setOpen(false);
      toast.success("Goal created successfully");
      onSuccess?.();
    } catch (error: any) {
      toast.error("Error creating goal", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

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

    if (typeof value === 'number') {
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
    }

    if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
      setError(
        `${currentQuestion.title}: ${
          validation.errorMessage || "Invalid format"
        }`
      );
      return false;
    }

    if (validation.custom && !validation.custom(value as QuestionValue)) {
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
    if (step === "goal-selection") {
      if (goalData.selectedGoal) {
        setStep("goal-specific");
      } else {
        setError("Please select a goal");
      }
    } else if (step === "goal-specific") {
      if (validateCurrentStep()) {
        if (selectedGoal && currentGoalStep < selectedGoal.questions.length - 1) {
          setCurrentGoalStep(currentGoalStep + 1);
        } else {
          moveToInvestmentSuggestions();
        }
      }
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    setError("");
    if (step === "goal-specific") {
      if (currentGoalStep > 0) {
        setCurrentGoalStep(currentGoalStep - 1);
      } else {
        setStep("goal-selection");
      }
    } else if (step === "investment-suggestions") {
      setStep("goal-specific");
    }
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

  const renderQuestion = (question: Question) => {
    const value = goalData[question.id];
    const calculatedInfo = question.calculateInfo?.(goalData);
    const showInfo = calculatedInfo || undefined;

    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.title}</Label>
            <Input
              id={question.id}
              placeholder={question.placeholder}
              value={typeof value === 'string' ? value : ''}
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
              value={typeof value === 'number' ? value : ''}
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
                date={{ 
                  from: value instanceof Date ? value : new Date(), 
                  to: value instanceof Date ? value : new Date() 
                }}
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
              value={String(value || '')}
              onValueChange={(value) => handleInputChange(question.id, value)}
            >
              {question.options?.map((option) => (
                <div key={String(option.value)} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={String(option.value)}
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

  const resetForm = () => {
    setStep("goal-selection");
    setCurrentGoalStep(0);
    setGoalData({ cost: 0, years: 0, dateOfBirth: new Date() });
    setError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
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
            {step === "investment-suggestions"
              ? "Choose investments for your goal"
              : "Set up a new financial goal with your target amount and timeline."}
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

        <div className="min-h-[300px] w-full">
          {step === "goal-selection" && renderGoalSelection()}
          {step === "goal-specific" && renderGoalSpecificQuestions()}
          {step === "investment-suggestions" && (
            <InvestmentSuggestions
              goalData={{
                ...goalData,
                priority: goalData.priority || "medium" as GoalPriority,
              }}
              onSkip={() => handleCreateGoalWithInvestments(null)}
              onInvestmentSelect={(investments) => handleCreateGoalWithInvestments(investments)}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-destructive text-sm">{error}</p>}

        {/* Footer buttons */}
        {step !== "investment-suggestions" && (
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
                ? "Continue to Investments"
                : "Continue"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

