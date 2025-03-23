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
import {
  CalendarIcon,
  Plus,
  TrendingUp,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AssetType, RiskLevel } from "@prisma/client";
import { AssetData, createAsset, getGoals } from "@/app/actions/serverActions";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { Progress } from "./ui/progress";
import { Calendar } from "@/components/ui/calendar";

interface AddInvestmentDialogProps {
  onInvestmentAdded?: () => void;
}

interface InvestmentData {
  name: string;
  type: AssetType;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  risk?: RiskLevel;
  currency: string;
  goalId?: string;
  [key: string]: any;
}

const INVESTMENT_TYPES = [
  {
    id: "stock",
    name: "Stock",
    icon: TrendingUp,
    description: "Individual company shares",
  },
  {
    id: "mf",
    name: "Mutual Fund",
    icon: ArrowUpRight,
    description: "Pooled investment funds",
  },
  {
    id: "etf",
    name: "ETF",
    icon: TrendingUp,
    description: "Exchange-traded funds",
  },
  {
    id: "fd",
    name: "Fixed Deposit",
    icon: Wallet,
    description: "Bank fixed deposits",
  },
];

export function AddInvestmentDialog({
  onInvestmentAdded,
}: AddInvestmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Array<{ id: string; name: string }>>([]);
  const router = useRouter();

  const [formData, setFormData] = useState<AssetData>({
    name: "",
    type: "stock",
    symbol: "",
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date(),
    risk: "moderate",
    currency: "INR",
  });

  const totalSteps = 3;

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: "",
      type: "stock",
      symbol: "",
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: new Date(),
      risk: "moderate",
      currency: "INR",
    });
    setError(null);
    setLoading(false);
  };

  const handleNext = async () => {
    setError(null);

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        await fetchGoals();
      }
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateStep1 = () => {
    if (!formData.name?.trim()) {
      setError("Please enter an investment name");
      return false;
    }
    if (!formData.type) {
      setError("Please select an investment type");
      return false;
    }
    if (!formData.symbol?.trim()) {
      setError("Please enter a ticker symbol");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.quantity || formData.quantity <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      setError("Please enter a valid purchase price");
      return false;
    }
    if (!formData.purchaseDate) {
      setError("Please select a purchase date");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.goalId) {
      setError("Please select a goal");
      return false;
    }
    return true;
  };

  const fetchGoals = async () => {
    try {
      const data = await getGoals();
      if (!data?.goals?.length) {
        setError("No goals found. Please create a goal first.");
        return;
      }
      setGoals(data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to fetch goals. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      await createAsset(formData);
      toast.success("Investment added successfully");
      setOpen(false);
      onInvestmentAdded?.();
      router.refresh();
    } catch (error) {
      console.error("Error creating investment:", error);
      if (error instanceof Error) {
        setError(error.message);
        toast.error("Failed to create investment", {
          description: error.message,
        });
      } else {
        setError("Failed to create investment");
        toast.error("Failed to create investment");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Investment Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter investment name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Investment Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: AssetType) =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select investment type" />
          </SelectTrigger>
          <SelectContent>
            {INVESTMENT_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symbol">Ticker Symbol</Label>
        <Input
          id="symbol"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          placeholder="Enter ticker symbol (e.g., RELIANCE)"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: parseFloat(e.target.value) })
          }
          placeholder="Enter quantity"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purchasePrice">Purchase Price (INR)</Label>
        <Input
          id="purchasePrice"
          type="number"
          value={formData.purchasePrice}
          onChange={(e) =>
            setFormData({
              ...formData,
              purchasePrice: parseFloat(e.target.value),
            })
          }
          placeholder="Enter purchase price in INR"
        />
      </div>

      <div className="space-y-2">
        <Label>Purchase Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.purchaseDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.purchaseDate ? (
                format(formData.purchaseDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.purchaseDate}
              onSelect={(date) =>
                setFormData({ ...formData, purchaseDate: date || new Date() })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goal">Select Goal</Label>
        <Select
          value={formData.goalId}
          onValueChange={(value) => 
            setFormData({ 
              ...formData, 
              goalId: value
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            {goals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Track Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 border-none overflow-hidden">
        <div className="h-1 bg-secondary w-full">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${(step / totalSteps) * 100}%`,
            }}
          />
        </div>
        <DialogHeader className="p-3">
          <DialogTitle>Track New Investment</DialogTitle>
          <DialogDescription>
            Add details about your investment to track its performance.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[300px] space-y-6 p-3">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {step === 1
                ? "Investment Details"
                : step === 2
                ? "Purchase Information"
                : "Goal Selection"}
            </h2>
            <p className="text-muted-foreground text-xs bg-secondary w-fit py-1 px-2 rounded-md border">
              Step {step} of {totalSteps}
            </p>
          </div>

          {step === 1
            ? renderStep1()
            : step === 2
            ? renderStep2()
            : renderStep3()}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
            )}
            <Button
              className={cn("ml-auto", step === 1 && "w-full")}
              onClick={handleNext}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : step === totalSteps
                ? "Add Investment"
                : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
