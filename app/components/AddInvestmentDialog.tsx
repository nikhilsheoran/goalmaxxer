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
import { CalendarIcon, Plus, TrendingUp, ArrowUpRight, Wallet } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AssetType, RiskLevel } from "@prisma/client";
import { createAsset, getGoals } from "@/app/actions/serverActions";
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
    id: "STOCK",
    name: "Stock",
    icon: TrendingUp,
    description: "Individual company shares",
  },
  {
    id: "MF",
    name: "Mutual Fund",
    icon: ArrowUpRight,
    description: "Pooled investment funds",
  },
  {
    id: "ETF",
    name: "ETF",
    icon: TrendingUp,
    description: "Exchange-traded funds",
  },
  {
    id: "FD",
    name: "Fixed Deposit",
    icon: Wallet,
    description: "Bank fixed deposits",
  },
];

export function AddInvestmentDialog({ onInvestmentAdded }: AddInvestmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Array<{ id: string; name: string }>>([]);
  const router = useRouter();

  const [formData, setFormData] = useState<InvestmentData>({
    name: "",
    type: "stock",
    symbol: "",
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date(),
    risk: "moderate",
    currency: "INR",
  });

  const investmentTypes = [
    { value: "stock", label: "Stock" },
    { value: "mf", label: "Mutual Fund" },
    { value: "etf", label: "ETF" },
    { value: "fd", label: "Fixed Deposit" },
  ];

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleNext2 = () => {
    if (validateStep2()) {
      setStep(3);
      fetchGoals();
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else {
      setStep(1);
    }
  };

  const validateStep1 = () => {
    if (!formData.name) {
      setError("Please enter an investment name");
      return false;
    }
    if (!formData.type) {
      setError("Please select an investment type");
      return false;
    }
    if (!formData.symbol) {
      setError("Please enter a ticker symbol");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (formData.quantity <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }
    if (formData.purchasePrice <= 0) {
      setError("Please enter a valid purchase price");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!formData.goalId) {
      setError("Please select a goal");
      return false;
    }
    setError(null);
    return true;
  };

  const fetchGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to fetch goals");
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
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
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
            {investmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
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
          onChange={(e) =>
            setFormData({ ...formData, symbol: e.target.value })
          }
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
            setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })
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
            setFormData({ ...formData, goalId: value })
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
          // Reset the form when dialog is closed
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
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Track Investment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Track New Investment</DialogTitle>
          <DialogDescription>
            Add details about your investment to track its performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={(step / 3) * 100} className="w-full" />
          
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}

          <div className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                className="ml-auto"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            ) : step === 2 ? (
              <Button
                className="ml-auto"
                onClick={handleNext2}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                className="ml-auto"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Investment"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 