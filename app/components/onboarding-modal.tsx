"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Home, Umbrella, Car, Plane, GraduationCap, Plus, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

interface DreamHomeData {
  cost: number;
  years: number;
  takingLoan: boolean;
  downPaymentPercentage: number;
  upfrontAmount: number;
  riskLevel: 'High' | 'Medium' | 'Low' | null;
}

interface RetireEasyData {
  monthlyExpenses: number;
  retirementAge: number;
  upfrontAmount: number;
}

interface BuyCarData {
  cost: number;
  years: number;
  upfrontAmount: number;
}

interface VacationData {
  cost: number;
  years: number;
  upfrontAmount: number;
}

interface EducationData {
  cost: number;
  years: number;
  upfrontAmount: number;
}

interface CustomGoalData {
  name: string;
  cost: number;
  years: number;
  upfrontAmount: number;
}

interface UserData {
  name: string;
  dateOfBirth: string;
  selectedGoal: string | null;
  dreamHome: DreamHomeData;
  retireEasy: RetireEasyData;
  buyCar: BuyCarData;
  vacation: VacationData;
  education: EducationData;
  customGoal: CustomGoalData;
}

export default function OnboardingModal() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string>("");
  const [userData, setUserData] = useState<UserData>({
    name: "",
    dateOfBirth: "",
    selectedGoal: null,
    dreamHome: {
      cost: 0,
      years: 0,
      takingLoan: false,
      downPaymentPercentage: 20,
      upfrontAmount: 0,
      riskLevel: null,
    },
    retireEasy: {
      monthlyExpenses: 0,
      retirementAge: 0,
      upfrontAmount: 0,
    },
    buyCar: {
      cost: 0,
      years: 0,
      upfrontAmount: 0,
    },
    vacation: {
      cost: 0,
      years: 0,
      upfrontAmount: 0,
    },
    education: {
      cost: 0,
      years: 0,
      upfrontAmount: 0,
    },
    customGoal: {
      name: "",
      cost: 0,
      years: 0,
      upfrontAmount: 0,
    },
  });

  const getTotalSteps = (goal: string | null) => {
    if (!goal) return 3;
    switch (goal) {
      case "Own Home":
        return 9;
      case "Create Own":
        return 7; // 3 initial + 4 goal-specific
      case "Retire Easy":
      case "Buy Car":
      case "Vacation":
      case "Educate Child":
        return 6; // 3 initial + 3 goal-specific
      default:
        return 3;
    }
  };

  const totalSteps = getTotalSteps(userData.selectedGoal);
  const inflation = 0.06; // 6% annual inflation
  const ltcg = 0.10; // 10% LTCG

  const calculateFutureCost = (currentCost: number, years: number): number => {
    return currentCost * Math.pow(1 + inflation, years);
  };

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
      default:
        const questionStep = step - 3;
        switch (userData.selectedGoal) {
          case "Own Home":
            switch (step) {
              case 4:
                if (userData.dreamHome.cost <= 0) {
                  setError("Please enter a valid home cost");
                  return false;
                }
                break;
              case 5:
                if (userData.dreamHome.years <= 0) {
                  setError("Please enter a valid number of years");
                  return false;
                }
                break;
              case 7:
                if (userData.dreamHome.downPaymentPercentage <= 0 || userData.dreamHome.downPaymentPercentage > 100) {
                  setError("Down payment percentage must be between 1 and 100");
                  return false;
                }
                break;
              case 8:
                if (userData.dreamHome.upfrontAmount <= 0) {
                  setError("Please enter a valid upfront amount");
                  return false;
                }
                const requiredDownPayment = (userData.dreamHome.cost * userData.dreamHome.downPaymentPercentage) / 100;
                if (userData.dreamHome.upfrontAmount < requiredDownPayment) {
                  setError(`Upfront amount must be at least ${requiredDownPayment.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} (${userData.dreamHome.downPaymentPercentage}% of home cost)`);
                  return false;
                }
                break;
              case 9:
                if (!userData.dreamHome.riskLevel) {
                  setError("Please select your risk level");
                  return false;
                }
                break;
            }
            break;

          case "Retire Easy":
            switch (questionStep) {
              case 1:
                if (userData.retireEasy.monthlyExpenses <= 0) {
                  setError("Please enter valid monthly expenses");
                  return false;
                }
                break;
              case 2:
                if (userData.retireEasy.retirementAge <= 0) {
                  setError("Please enter a valid retirement age");
                  return false;
                }
                const dob = new Date(userData.dateOfBirth);
                const today = new Date();
                const currentAge = today.getFullYear() - dob.getFullYear();
                if (userData.retireEasy.retirementAge <= currentAge) {
                  setError("Retirement age must be greater than your current age");
                  return false;
                }
                break;
              case 3:
                if (userData.retireEasy.upfrontAmount <= 0) {
                  setError("Please enter a valid upfront amount");
                  return false;
                }
                break;
            }
            break;

          case "Buy Car":
          case "Vacation":
          case "Educate Child":
            switch (questionStep) {
              case 1:
                const data = userData[userData.selectedGoal.toLowerCase().replace(" ", "") as keyof typeof userData] as any;
                if (data.cost <= 0) {
                  setError("Please enter a valid cost");
                  return false;
                }
                break;
              case 2:
                const timelineData = userData[userData.selectedGoal.toLowerCase().replace(" ", "") as keyof typeof userData] as any;
                if (timelineData.years <= 0) {
                  setError("Please enter a valid number of years");
                  return false;
                }
                break;
              case 3:
                const upfrontData = userData[userData.selectedGoal.toLowerCase().replace(" ", "") as keyof typeof userData] as any;
                if (upfrontData.upfrontAmount <= 0) {
                  setError("Please enter a valid upfront amount");
                  return false;
                }
                break;
            }
            break;

          case "Create Own":
            switch (questionStep) {
              case 1:
                if (!userData.customGoal.name.trim()) {
                  setError("Please enter a goal name");
                  return false;
                }
                break;
              case 2:
                if (userData.customGoal.cost <= 0) {
                  setError("Please enter a valid goal value");
                  return false;
                }
                break;
              case 3:
                if (userData.customGoal.years <= 0) {
                  setError("Please enter a valid number of years");
                  return false;
                }
                break;
              case 4:
                if (userData.customGoal.upfrontAmount <= 0) {
                  setError("Please enter a valid upfront amount");
                  return false;
                }
                break;
            }
            break;
        }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === totalSteps) {
        console.log("Final user data:", userData);
        // Handle form submission here
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const renderFutureCostInfo = (years: number, cost: number) => {
    if (years > 0 && cost > 0) {
      return (
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            In {years} years, accounting for inflation and LTCG:
            <span className="block text-lg font-semibold text-foreground mt-1">
              Estimated cost: {calculateFutureCost(cost, years)
                .toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderDreamHomeSteps = () => {
    switch (step) {
      case 4:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">Dream Home Cost</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                How much does your dream home cost today?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount in INR"
                value={userData.dreamHome.cost || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  dreamHome: { ...userData.dreamHome, cost: Number(e.target.value) }
                })}
                className="text-lg p-6"
                min="0"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">Timeline</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                In how many years do you want to buy this home?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter number of years"
                value={userData.dreamHome.years || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  dreamHome: { ...userData.dreamHome, years: Number(e.target.value) }
                })}
                className="text-lg p-6"
                min="1"
                max="30"
              />
              {userData.dreamHome.years > 0 && userData.dreamHome.cost > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    In {userData.dreamHome.years} years, accounting for inflation and LTCG:
                    <span className="block text-lg font-semibold text-foreground mt-1">
                      Estimated cost: {calculateFutureCost(userData.dreamHome.cost, userData.dreamHome.years)
                        .toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">Home Loan</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Will you be taking a home loan?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup
                value={userData.dreamHome.takingLoan ? "yes" : "no"}
                onValueChange={(value: string) => setUserData({
                  ...userData,
                  dreamHome: { ...userData.dreamHome, takingLoan: value === "yes" }
                })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">Down Payment</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                What percentage will be the down payment?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter percentage"
                value={userData.dreamHome.downPaymentPercentage || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  dreamHome: { ...userData.dreamHome, downPaymentPercentage: Number(e.target.value) }
                })}
                className="text-lg p-6"
                min="1"
                max="100"
              />
              {userData.dreamHome.downPaymentPercentage > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Required down payment:
                    <span className="block text-lg font-semibold text-foreground mt-1">
                      {((userData.dreamHome.cost * userData.dreamHome.downPaymentPercentage) / 100)
                        .toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">Upfront Amount</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                How much money can you give upfront?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount in INR"
                value={userData.dreamHome.upfrontAmount || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  dreamHome: { ...userData.dreamHome, upfrontAmount: Number(e.target.value) }
                })}
                className="text-lg p-6"
                min="0"
              />
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold tracking-tight">Risk Profile</DialogTitle>
              <DialogDescription className="text-lg mt-2">
                How risk averse are you?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              {(['High', 'Medium', 'Low'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setUserData({
                    ...userData,
                    dreamHome: { ...userData.dreamHome, riskLevel: level }
                  })}
                  className={`
                    p-6 border rounded-lg hover:shadow-md transition-all duration-200
                    ${userData.dreamHome.riskLevel === level
                      ? 'border-primary ring-2 ring-primary bg-primary/5'
                      : 'hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <p className="text-center font-medium">{level}</p>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const showProgressBar = step > 2; // Only show progress bar after goal selection
  const isInitialStep = step <= 2; // Different styling for initial steps

  const renderGoalSpecificSteps = () => {
    if (!userData.selectedGoal) return null;

    const questionStep = step - 3; // Adjust for initial steps

    switch (userData.selectedGoal) {
      case "Retire Easy":
        switch (questionStep) {
          case 1:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Monthly Expenses</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    What are your current monthly expenses?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.retireEasy.monthlyExpenses || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      retireEasy: { ...userData.retireEasy, monthlyExpenses: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
          case 2:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Retirement Age</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    At what age do you want to retire?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter retirement age"
                    value={userData.retireEasy.retirementAge || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      retireEasy: { ...userData.retireEasy, retirementAge: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            );
          case 3:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Upfront Amount</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much money can you give upfront?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.retireEasy.upfrontAmount || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      retireEasy: { ...userData.retireEasy, upfrontAmount: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
        }
        break;

      case "Buy Car":
        switch (questionStep) {
          case 1:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Car Cost</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much does your dream car cost today?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.buyCar.cost || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      buyCar: { ...userData.buyCar, cost: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
          case 2:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Timeline</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    In how many years do you want to buy this car?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter number of years"
                    value={userData.buyCar.years || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      buyCar: { ...userData.buyCar, years: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="1"
                    max="30"
                  />
                  {renderFutureCostInfo(userData.buyCar.years, userData.buyCar.cost)}
                </div>
              </div>
            );
          case 3:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Upfront Amount</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much money can you give upfront?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.buyCar.upfrontAmount || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      buyCar: { ...userData.buyCar, upfrontAmount: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
        }
        break;

      case "Vacation":
        switch (questionStep) {
          case 1:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Vacation Cost</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much does your dream vacation cost today?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.vacation.cost || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      vacation: { ...userData.vacation, cost: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
          case 2:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Timeline</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    In how many years do you want to go for this vacation?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter number of years"
                    value={userData.vacation.years || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      vacation: { ...userData.vacation, years: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="1"
                    max="30"
                  />
                  {renderFutureCostInfo(userData.vacation.years, userData.vacation.cost)}
                </div>
              </div>
            );
          case 3:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Upfront Amount</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much money can you give upfront?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.vacation.upfrontAmount || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      vacation: { ...userData.vacation, upfrontAmount: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
        }
        break;

      case "Educate Child":
        switch (questionStep) {
          case 1:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Education Cost</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    In today's terms how much you want to save for your kids education?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.education.cost || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      education: { ...userData.education, cost: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
          case 2:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Timeline</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    In how many years do you want to achieve this?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter number of years"
                    value={userData.education.years || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      education: { ...userData.education, years: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="1"
                    max="30"
                  />
                  {renderFutureCostInfo(userData.education.years, userData.education.cost)}
                </div>
              </div>
            );
          case 3:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Upfront Amount</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much money can you give upfront?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.education.upfrontAmount || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      education: { ...userData.education, upfrontAmount: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
        }
        break;

      case "Create Own":
        switch (questionStep) {
          case 1:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Goal Name</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    What's the goal name?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter goal name"
                    value={userData.customGoal.name}
                    onChange={(e) => setUserData({
                      ...userData,
                      customGoal: { ...userData.customGoal, name: e.target.value }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                  />
                </div>
              </div>
            );
          case 2:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Goal Value</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    What is the value of the goal at present?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.customGoal.cost || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      customGoal: { ...userData.customGoal, cost: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
          case 3:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Timeline</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    In how many years do you want to achieve this?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter number of years"
                    value={userData.customGoal.years || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      customGoal: { ...userData.customGoal, years: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="1"
                    max="30"
                  />
                  {renderFutureCostInfo(userData.customGoal.years, userData.customGoal.cost)}
                </div>
              </div>
            );
          case 4:
            return (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold tracking-tight">Upfront Amount</DialogTitle>
                  <DialogDescription className="text-lg mt-2">
                    How much money can you give upfront?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount in INR"
                    value={userData.customGoal.upfrontAmount || ''}
                    onChange={(e) => setUserData({
                      ...userData,
                      customGoal: { ...userData.customGoal, upfrontAmount: Number(e.target.value) }
                    })}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-6"
                    min="0"
                  />
                </div>
              </div>
            );
        }
        break;

      case "Own Home":
        return renderDreamHomeSteps();
    }
  };

  const renderStep = () => {
    if (step <= 3) {
      switch (step) {
        case 1:
          return (
            <div className="space-y-8">
              <DialogHeader className="text-center">
                <DialogTitle className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Welcome to GoalMaxxer
                </DialogTitle>
                <DialogDescription className="text-xl mt-4">
                  Let&apos;s get to know you better!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg font-medium">
                    What&apos;s your name?
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="text-lg p-6 rounded-xl"
                  />
                </div>
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-8">
              <DialogHeader className="text-center">
                <DialogTitle className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Hello, {userData.name}!
                </DialogTitle>
                <DialogDescription className="text-xl mt-4">
                  When&apos;s your birthday?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-lg font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={userData.dateOfBirth}
                    onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })}
                    className="text-lg p-6 rounded-xl w-full"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-8">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold tracking-tight">Set your Goal</DialogTitle>
                <DialogDescription className="text-xl mt-4">
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
                    onClick={() => {
                      setUserData({ ...userData, selectedGoal: goal.name });
                      // Validate and proceed to next step immediately
                      setError("");
                      setStep(step + 1);
                    }}
                    className={`
                      p-8 border rounded-xl hover:shadow-md transition-all duration-200
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
                      <p className="text-center font-medium">{goal.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
      }
    }
    return renderGoalSpecificSteps();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`sm:max-w-[800px] p-8 ${isInitialStep ? 'sm:max-w-[600px]' : ''}`}>
        {showProgressBar && (
          <div className="w-full h-2 bg-secondary rounded-full mb-8">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step - 2) / (totalSteps - 2)) * 100}%` }}
            />
          </div>
        )}

        <div className={`${isInitialStep ? 'py-8' : ''}`}>
          {renderStep()}
        </div>

        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="min-w-[100px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div /> 
          )}
          <Button
            onClick={handleNext}
            size="lg"
            className="min-w-[100px]"
          >
            {step === totalSteps ? "Submit" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
