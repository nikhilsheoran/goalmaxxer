"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AssetType, RiskLevel } from "@prisma/client";
import { getInvestmentSuggestions } from "@/app/actions/serverActions";
import { toast } from "sonner";
import { TrendingUp, ArrowUpRight, Wallet, ChevronRight, PieChart, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { GoalData } from "@/app/actions/serverActions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Progress } from "@/app/components/ui/progress";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface InvestmentSuggestionsProps {
  goalData: GoalData;
  onSkip: () => void;
  onInvestmentSelect: (investments: SuggestedInvestment[]) => void;
  isLoading: boolean;
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

const getAssetTypeIcon = (type: AssetType) => {
  switch (type) {
    case "stock":
      return <TrendingUp className="h-4 w-4" />;
    case "mf":
      return <ArrowUpRight className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
};

const getRiskColor = (risk: RiskLevel) => {
  switch (risk) {
    case "high":
      return "text-red-500 bg-red-50 dark:bg-red-950";
    case "moderate":
      return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    default:
      return "text-blue-500 bg-blue-50 dark:bg-blue-950";
  }
};

export function InvestmentSuggestions({
  goalData,
  onSkip,
  onInvestmentSelect,
  isLoading,
}: InvestmentSuggestionsProps) {
  const [suggestedInvestments, setSuggestedInvestments] = useState<SuggestedInvestment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<'recommended' | 'skip'>('recommended');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { suggestions } = await getInvestmentSuggestions(goalData);
        setSuggestedInvestments(suggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to load investment suggestions");
        toast.error("Failed to load investment suggestions");
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [goalData]);

  const totalInvestment = suggestedInvestments.reduce(
    (sum, inv) => sum + inv.purchasePrice * inv.quantity,
    0
  );

  const averageRisk = suggestedInvestments.reduce(
    (sum, inv) => sum + (inv.risk === 'high' ? 3 : inv.risk === 'moderate' ? 2 : 1),
    0
  ) / suggestedInvestments.length;

  const averageReturn = suggestedInvestments.reduce(
    (sum, inv) => sum + inv.expectedReturn,
    0
  ) / suggestedInvestments.length;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={onSkip} className="mt-4" disabled={isLoading}>
          Skip for Now
        </Button>
      </div>
    );
  }

  if (loadingSuggestions) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing your goal and finding the best investments...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      <div className="space-y-2 flex-shrink-0">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Recommended Portfolio
        </h2>
        <p className="text-muted-foreground text-sm">
          We've crafted a balanced portfolio to help you reach your goal
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-6">
        <div className="px-6 space-y-6">
          {/* Portfolio Summary */}
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="font-semibold">{formatCurrency(totalInvestment)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Based on the average risk of all investments</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Progress value={averageRisk * 33.33} className="h-2" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                  <p className="font-semibold text-primary">+{averageReturn.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Cards */}
          <div className="grid grid-cols-1 gap-4">
            {suggestedInvestments.map((investment, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", getRiskColor(investment.risk))}>
                      {getAssetTypeIcon(investment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">
                            {investment.name}
                            {investment.symbol && (
                              <span className="text-sm text-muted-foreground ml-1">
                                ({investment.symbol})
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {investment.description}
                          </p>
                        </div>
                        <p className="font-semibold whitespace-nowrap shrink-0">
                          {formatCurrency(investment.purchasePrice * investment.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-primary whitespace-nowrap">+{investment.expectedReturn}% return</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
                          getRiskColor(investment.risk)
                        )}>
                          {investment.risk} risk
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 flex-shrink-0">
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => onInvestmentSelect(suggestedInvestments)}
          disabled={isLoading}
        >
          Buy Complete Portfolio <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onSkip}
          disabled={isLoading}
        >
          Skip Investment for Now
        </Button>
      </div>
    </div>
  );
} 