import { Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/app/actions/serverActions";
import { formatCurrency } from "@/lib/utils";
import { StockChartDialog } from "@/app/components/StockChartDialog";
import { AddInvestmentDialog } from "@/app/components/AddInvestmentDialog";
import { AssetActions } from "@/app/components/AssetActions";
import { cn } from "@/lib/utils";

const getAssetTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'stock':
      return <TrendingUp className="h-5 w-5" />;
    case 'mf':
      return <ArrowUpRight className="h-5 w-5" />;
    case 'etf':
      return <TrendingUp className="h-5 w-5" />;
    default:
      return <Wallet className="h-5 w-5" />;
  }
};

export default async function InvestmentsPage() {
  const data = await getDashboardData();

  // Sort assets by current value
  const sortedAssets = [...data.recentAssets].sort((a, b) => 
    (b.currentValue || 0) - (a.currentValue || 0)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Investment Portfolio</h1>
        <p className="text-muted-foreground text-lg">Manage and track your investment assets.</p>
      </div>

      <div className="flex justify-end">
        <AddInvestmentDialog />
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {sortedAssets.length > 0 ? (
          sortedAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      asset.risk === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      asset.risk === "moderate" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {asset.type === "stock" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : asset.type === "mf" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : asset.type === "etf" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {asset.name}
                        {asset.symbol && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({asset.symbol})
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          asset.risk === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          asset.risk === "moderate" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                          {asset.risk || "moderate"} risk
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {asset.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(asset.currentValue || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {asset.quantity} × {formatCurrency(asset.purchasePrice)}
                      </p>
                    </div>
                    <AssetActions asset={{
                      id: asset.id,
                      name: asset.name,
                      type: asset.type,
                      symbol: asset.symbol || undefined,
                      quantity: asset.quantity,
                      purchasePrice: asset.purchasePrice,
                      purchaseDate: new Date(asset.purchaseDate),
                      risk: asset.risk || undefined,
                      currency: asset.currency || "INR",
                      goalId: asset.goalId || undefined,
                      currentValue: asset.currentValue || undefined,
                    }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first investment asset!</p>
              {/* Removed Add New Asset button */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 