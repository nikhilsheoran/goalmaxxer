"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COMMON_QUESTIONS, GOALS, Question, Goal, INFLATION_RATE } from "@/app/lib/config";
import { cn } from "@/lib/utils";
import DatePicker from "@/components/ui/date-picker";
import { completeOnboarding, createGoal, GoalData } from "@/app/actions/serverActions";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { InvestmentSuggestions } from "./InvestmentSuggestions";
import { AssetType, RiskLevel as PrismaRiskLevel, GoalPriority } from "@prisma/client";

// Remove or comment out the local type definition
// type AssetType = "stock" | "mf" | "etf" | "fd";
type RiskLevel = "high" | "moderate" | "low";

interface UserData {
  dateOfBirth?: Date;
  selectedGoal?: string;
  cost?: number;
  years?: number;
  upfrontAmount?: number;
  monthlyExpenses?: number;
  retirementAge?: number;
  priority?: GoalPriority;
  [key: string]: any;
}

interface SuggestedInvestment {
  name: string;
  type: AssetType;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  risk: RiskLevel;
  description: string;
  expectedReturn: number;
  currency: string;
}

type Step = 'common' | 'goal-selection' | 'goal-specific' | 'investment-suggestions';

// Average life expectancy in India is ~70 years
const LIFE_EXPECTANCY = 85;
// Average inflation rate for retirement planning
const RETIREMENT_INFLATION = 0.06; // 6%
// Estimated return on investment during retirement (conservative)
const RETIREMENT_RETURN = 0.05; // 5%

export default function OnboardingModal({isOnBoardingDone=false}:{isOnBoardingDone?:boolean}) {
  const [open, setOpen] = useState(!isOnBoardingDone);
  const [step, setStep] = useState<Step>('common');
  const [currentGoalStep, setCurrentGoalStep] = useState(0);
  const [error, setError] = useState<string>("");
  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Function to handle dialog open state changes
  const handleOpenChange = (newOpenState: boolean) => {
    // Only allow closing if onboarding is already done or has been completed
    if (isOnBoardingDone || onboardingCompleted) {
      setOpen(newOpenState);
    } else {
      // Keep it open if onboarding is not done
      setOpen(true);
    }
  };

  const selectedGoal = GOALS.find(goal => goal.id === userData.selectedGoal);
  const currentQuestion = selectedGoal?.questions[currentGoalStep];
  
  // Calculate retirement corpus based on monthly expenses and retirement age
  const calculateRetirementCorpus = () => {
    if (!userData.monthlyExpenses || !userData.retirementAge || !userData.dateOfBirth) return 0;
    
    // Calculate years until retirement
    const today = new Date();
    const birthDate = new Date(userData.dateOfBirth);
    const currentAge = today.getFullYear() - birthDate.getFullYear();
    const yearsUntilRetirement = userData.retirementAge - currentAge;
    
    // Calculate retirement duration (life expectancy - retirement age)
    const retirementDuration = LIFE_EXPECTANCY - userData.retirementAge;
    
    // Calculate future monthly expenses at retirement age
    const futureMonthlyExpenses = userData.monthlyExpenses * Math.pow(1 + RETIREMENT_INFLATION, yearsUntilRetirement);
    
    // Calculate annual expenses in retirement
    const annualExpensesInRetirement = futureMonthlyExpenses * 12;
    
    // Calculate corpus needed using the formula: Corpus = Annual Expenses * [(1 - (1 + r)^-n) / r]
    // where r is the expected return rate and n is the number of years in retirement
    const r = RETIREMENT_RETURN;
    const n = retirementDuration;
    const corpus = annualExpensesInRetirement * ((1 - Math.pow(1 + r, -n)) / r);
    
    return Math.round(corpus);
  };

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

  const moveToInvestmentSuggestions = async () => {
    try {
      if (!userData.dateOfBirth || !userData.selectedGoal) {
        throw new Error("Missing required data");
      }
      
      // For retirement, calculate the target amount based on monthly expenses
      let costValue = userData.cost || 0;
      if (userData.selectedGoal === 'retireEasy') {
        costValue = calculateRetirementCorpus();
        // Update the userData with the calculated cost
        setUserData(prevData => ({
          ...prevData,
          cost: costValue
        }));
      }

      // Ensure priority is set with a default if not selected
      if (!userData.priority) {
        setUserData(prevData => ({
          ...prevData,
          priority: "medium" as GoalPriority
        }));
      }

      // Complete the onboarding without waiting for investment selection
      await completeOnboarding({
        dateOfBirth: userData.dateOfBirth,
        selectedGoal: userData.selectedGoal,
        cost: costValue,
        years: userData.years || 0,
        upfrontAmount: userData.upfrontAmount || 0,
        priority: userData.priority || "medium" as GoalPriority,
        ...userData
      });
      
      setOnboardingCompleted(true);
      setStep('investment-suggestions');
    } catch (error) {
      console.error("Error during onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  const handleCreateGoalWithInvestments = async (investments: SuggestedInvestment[] | null) => {
    setIsLoading(true);
    try {
      if (!userData.dateOfBirth || !userData.selectedGoal) {
        throw new Error("Missing required data");
      }
      
      // For retirement, ensure the target amount is calculated based on monthly expenses
      let costValue = userData.cost || 0;
      if (userData.selectedGoal === 'retireEasy' && userData.monthlyExpenses) {
        costValue = calculateRetirementCorpus();
      }

      // Ensure priority is set
      const priority = userData.priority || "medium" as GoalPriority;

      // Create the goal with the selected investments
      await createGoal({
        name: selectedGoal?.name || "Custom Goal",
        selectedGoal: userData.selectedGoal,
        cost: costValue,
        years: userData.years || 0,
        upfrontAmount: userData.upfrontAmount || 0,
        dateOfBirth: userData.dateOfBirth,
        priority: priority,
        // Pass investments through a custom property since it's handled separately in the serverAction
        ...(investments ? { investments } : {})
      });
      
      toast.success("Goal created successfully with investments!");
      setOpen(false);
    } catch (error) {
      console.error("Error creating goal with investments:", error);
      toast.error("Failed to create goal with investments. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            // Move to investment suggestions instead of completing onboarding here
            await moveToInvestmentSuggestions();
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
      case 'investment-suggestions':
        setStep('goal-specific');
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
            {userData.selectedGoal === 'retireEasy' && question.id === 'monthlyExpenses' && userData.monthlyExpenses && userData.retirementAge && userData.dateOfBirth && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p className="font-medium">Estimated retirement corpus needed: {calculateRetirementCorpus().toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
              </div>
            )}
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
      case 'investment-suggestions':
        return (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Recommended Investments</h2>
            <InvestmentSuggestions 
              goalData={{
                name: selectedGoal?.name || "Custom Goal",
                selectedGoal: userData.selectedGoal,
                cost: userData.cost || 0,
                years: userData.years || 0,
                upfrontAmount: userData.upfrontAmount || 0,
                priority: userData.priority || "medium" as GoalPriority,
              }}
              onSkip={() => handleCreateGoalWithInvestments(null)}
              onInvestmentSelect={(investments) => handleCreateGoalWithInvestments(investments)}
              isLoading={isLoading}
            />
          </div>
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent 
        className={cn(
          "max-w-[600px] p-0 gap-0 overflow-hidden border-none",
          step === 'investment-suggestions' && "sm:max-w-[700px]"
        )}
        hideCloseButton={!isOnBoardingDone && !onboardingCompleted}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape key if onboarding is not done
          if (!isOnBoardingDone && !onboardingCompleted) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside if onboarding is not done
          if (!isOnBoardingDone && !onboardingCompleted) {
            e.preventDefault();
          }
        }}
      >
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
          <div className={cn(
            "min-h-[400px] flex flex-col",
            step === 'investment-suggestions' && "min-h-[450px]"
          )}>
            {renderContent()}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          {/* Navigation buttons - Don't show in investment suggestions step as that has its own buttons */}
          {step !== 'investment-suggestions' && (
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
                  ? "Continue to Investments" 
                  : "Continue"}
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
