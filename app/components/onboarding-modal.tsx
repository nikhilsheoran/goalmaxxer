"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COMMON_QUESTIONS, GOALS, Question, Goal } from "@/app/lib/config";
import { cn } from "@/lib/utils";
import DatePicker from "@/components/ui/date-picker";
import { completeOnboarding } from "@/app/actions/serverActions";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";

interface UserData {
  dateOfBirth?: Date;
  selectedGoal?: string;
  cost?: number;
  years?: number;
  upfrontAmount?: number;
  [key: string]: any;
}

type Step = 'common' | 'goal-selection' | 'goal-specific';

export default function OnboardingModal({isOnBoardingDone=false}:{isOnBoardingDone?:boolean}) {
  const [open, setOpen] = useState(!isOnBoardingDone);
  const [step, setStep] = useState<Step>('common');
  const [currentGoalStep, setCurrentGoalStep] = useState(0);
  const [error, setError] = useState<string>("");
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);

  const selectedGoal = GOALS.find(goal => goal.id === userData.selectedGoal);
  const currentQuestion = selectedGoal?.questions[currentGoalStep];

  const validateCommonQuestions = () => {
    setError("");
    for (const question of COMMON_QUESTIONS) {
      const value = userData[question.id];
      const validation = question.validation;

      if (!validation) continue;

      if (validation.required && !value) {
        setError(`${question.title}: ${validation.errorMessage || "This field is required"}`);
        return false;
      }

      if (validation.min !== undefined && value < validation.min) {
        setError(`${question.title}: ${validation.errorMessage || `Value must be at least ${validation.min}`}`);
        return false;
      }

      if (validation.max !== undefined && value > validation.max) {
        setError(`${question.title}: ${validation.errorMessage || `Value must be at most ${validation.max}`}`);
        return false;
      }

      if (validation.pattern && !validation.pattern.test(value)) {
        setError(`${question.title}: ${validation.errorMessage || "Invalid format"}`);
        return false;
      }

      if (validation.custom && !validation.custom(value)) {
        setError(`${question.title}: ${validation.errorMessage || "Invalid value"}`);
        return false;
      }
    }
    return true;
  };

  const validateCurrentStep = () => {
    setError("");
    if (!currentQuestion) return true;

    const value = userData[currentQuestion.id];
    const validation = currentQuestion.validation;

    if (!validation) return true;

    if (validation.required && !value) {
      setError(validation.errorMessage || "This field is required");
      return false;
    }

    if (validation.min !== undefined && value < validation.min) {
      setError(validation.errorMessage || `Value must be at least ${validation.min}`);
      return false;
    }

    if (validation.max !== undefined && value > validation.max) {
      setError(validation.errorMessage || `Value must be at most ${validation.max}`);
      return false;
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      setError(validation.errorMessage || "Invalid format");
      return false;
    }

    if (validation.custom && !validation.custom(value)) {
      setError(validation.errorMessage || "Invalid value");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setIsLoading(true);
    switch (step) {
      case 'common':
        if (validateCommonQuestions()) {
          setStep('goal-selection');
        }
        break;
      case 'goal-selection':
        if (userData.selectedGoal) {
          setStep('goal-specific');
        } else {
          setError("Please select a goal");
        }
        break;
      case 'goal-specific':
        if (validateCurrentStep()) {
          if (selectedGoal && currentGoalStep < selectedGoal.questions.length - 1) {
            setCurrentGoalStep(currentGoalStep + 1);
          } else {
            try {
              if (!userData.dateOfBirth || !userData.selectedGoal) {
                throw new Error("Missing required data");
              }

              await completeOnboarding({
                dateOfBirth: userData.dateOfBirth,
                selectedGoal: userData.selectedGoal,
                cost: userData.cost || 0,
                years: userData.years || 0,
                upfrontAmount: userData.upfrontAmount || 0,
                ...userData
              });
              
              toast.success("Onboarding completed successfully!");
              setOpen(false);
            } catch (error) {
              console.error("Error during onboarding:", error);
              toast.error("Failed to complete onboarding. Please try again.");
            }
          }
        }
        break;
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    switch (step) {
      case 'goal-selection':
        setStep('common');
        break;
      case 'goal-specific':
        if (currentGoalStep > 0) {
          setCurrentGoalStep(currentGoalStep - 1);
        } else {
          setStep('goal-selection');
        }
        break;
    }
    setError("");
  };


  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-2" key={question.id}>
            <Label className="text-base font-medium">{question.title}</Label>
            <p className="text-sm text-muted-foreground mb-2">{question.description}</p>
            <Input
              key={question.id}
              type={"text"}
              placeholder={question.placeholder} 
              value={userData[question.id] || ''}
              onChange={(e) => setUserData({ ...userData, [question.id]: e.target.value })}
              required={question.validation?.required}
              autoFocus
            />
          </div>
        )
      case 'number':
        return (
          <div className="space-y-2" key={question.id}>
            <Label className="text-base font-medium">{question.title}</Label>
            <p className="text-sm text-muted-foreground mb-2">{question.description}</p>
            <Input
              key={question.id}
              type={"number"}
              placeholder={question.placeholder}
              value={userData[question.id] || ''}
              onChange={(e) => setUserData({ ...userData, [question.id]: Number(e.target.value) })}
              required={question.validation?.required}
              min={question.validation?.min}
              max={question.validation?.max}
              step={question.validation?.step ?? 5}
              onKeyDown={(e)=>{
                if(e.key === 'Enter'){
                  handleNext();
                }
              }}
              autoFocus
            />
          </div>
        )
      case 'date':
        return (
          <div className="space-y-2" key={question.id}>
            <Label className="text-base font-medium">{question.title}</Label>
            <p className="text-sm text-muted-foreground mb-2">{question.description}</p>
            <DatePicker
              key={question.id}
              date={userData[question.id]}
              setDate={(date)=>{
                setUserData({ ...userData, [question.id]: date })
              }}
              required={question.validation?.required}
            />
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2" key={question.id}>
            <Label className="text-base font-medium">{question.title}</Label>
            <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
            <RadioGroup
              value={userData[question.id]}
              onValueChange={(value) => setUserData({ ...userData, [question.id]: value })}
              className="grid grid-cols-2 gap-4"
            >
              {question.options?.map((option: { value: string | number; label: string }) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    "hover:border-primary/50 cursor-pointer transition-colors",
                    userData[question.id] === option.value && "border-primary bg-primary/5"
                  )}
                >
                  <Label htmlFor={option.value.toString()} className="w-full cursor-pointer">
                    {option.label}
                  </Label>
                  <RadioGroupItem value={option.value.toString()} id={option.value.toString()} />
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  const renderCommonQuestions = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome to GoalMaxxer</h2>
        <p className="text-muted-foreground mt-2">Let's get to know you better!</p>
      </div>

      <div className="space-y-6">
        {COMMON_QUESTIONS.map(question => renderQuestion(question))}
      </div>
    </div>
  );

  const renderGoalSelection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Set your Goal</h2>
        <p className="text-muted-foreground mt-2">We'll help you bring your dreams to life!</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {GOALS.map((goal: Goal) => (
          <button
            key={goal.id}
            onClick={() => {
              setUserData({ ...userData, selectedGoal: goal.id });
            }}
            className={cn(
              "p-4 border rounded-xl transition-all duration-200",
              "hover:shadow-lg hover:scale-[1.02]",
              "flex flex-col items-center gap-2",
              userData.selectedGoal === goal.id && "border-primary ring-2 ring-primary bg-primary/5"
            )}
          >
            <div className="text-primary">
              <goal.icon className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium">{goal.name}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGoalSpecificQuestions = () => {
    if (!currentQuestion) return null;

    const showInfo = currentQuestion.calculateInfo?.(userData);
    const shouldShow = currentQuestion.showWhen?.(userData) ?? true;

    if (!shouldShow) {
      handleNext();
      return null;
    }

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{selectedGoal?.name}</h2>
          <p className="text-muted-foreground mt-2">Step {currentGoalStep + 1} of {selectedGoal?.questions.length}</p>
        </div>

        <div className="space-y-6">
          {renderQuestion(currentQuestion)}
          
          {showInfo && (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{showInfo}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 'common':
        return renderCommonQuestions();
      case 'goal-selection':
        return renderGoalSelection();
      case 'goal-specific':
        return renderGoalSpecificQuestions();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle>
      </DialogTitle>
      <DialogContent className="max-w-[600px] p-0 gap-0 overflow-hidden border-none">
        {/* Progress bar */}
        {step === 'goal-specific' && selectedGoal && (
          <div className="h-1 bg-secondary w-full">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ 
                width: `${((currentGoalStep + 1) / selectedGoal.questions.length) * 100}%` 
              }}
            />
          </div>
        )}

        <div className="p-8 space-y-8">
          {/* Main content */}
          <div className="min-h-[400px] flex flex-col">
            {renderContent()}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t">
            {step !== 'common' ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} disabled={isLoading} className="flex items-center gap-2">
              {step === 'goal-specific' && selectedGoal && currentGoalStep === selectedGoal.questions.length - 1 
                ? "Submit" 
                : "Continue"}
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
