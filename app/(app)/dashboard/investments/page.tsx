import { Wallet, Plus, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/app/actions/serverActions";
import { formatCurrency } from "@/lib/utils";

const getAssetTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'stock':
      return <TrendingUp className="h-5 w-5" />;
    case 'mf':
      return <ArrowUpRight className="h-5 w-5" />;
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add New Asset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {sortedAssets.length > 0 ? (
          sortedAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-start gap-4 md:w-1/3">
                    <div className="p-2 bg-primary/10 rounded-full mt-1">
                      {getAssetTypeIcon(asset.type)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {asset.name}
                        {asset.symbol && (
                          <span className="text-sm text-muted-foreground ml-2">({asset.symbol})</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground capitalize">
                          {asset.type.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        asset.risk?.toUpperCase() === 'HIGH' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                          : asset.risk?.toUpperCase() === 'MODERATE' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {asset.risk?.toLowerCase() || 'unknown'} risk
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="text-2xl font-semibold tracking-tight">
                          {formatCurrency(asset.currentValue || 0)}
                        </p>
                        {asset.currentValue && asset.purchasePrice && (
                          <div className="flex items-center gap-2">
                            {((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) > 0 ? (
                              <>
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium text-green-500">
                                  +{((asset.currentValue - asset.purchasePrice) / asset.purchasePrice * 100).toFixed(2)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-500">
                                  {((asset.currentValue - asset.purchasePrice) / asset.purchasePrice * 100).toFixed(2)}%
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                        <p className="text-2xl font-semibold tracking-tight">
                          {formatCurrency(asset.purchasePrice || 0)}
                        </p>
                        {asset.currentValue && asset.purchasePrice && (
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Math.abs(asset.currentValue - asset.purchasePrice))} {asset.currentValue > asset.purchasePrice ? 'profit' : 'loss'}
                          </p>
                        )}
                      </div>
                    </div>
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
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add New Asset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 