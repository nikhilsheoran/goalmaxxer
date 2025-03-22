import { Goal, Wallet, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardData } from "@/app/actions/serverActions";
import { formatCurrency } from "@/lib/utils";
import { AddGoalDialog } from "@/app/components/AddGoalDialog";

// Helper function to sort goals by priority
type Priority = 'low' | 'medium' | 'high';
type Goal = {
  id: string;
  priority: Priority;
  currentAmt: number;
  targetAmt: number;
  name: string;
};

const sortGoalsByPriority = (goals: Goal[]) => {
  const priorityMap: Record<string, number> = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
  
  // For debugging
  
  return [...goals].sort((a, b) => {
    // Normalize priority to uppercase for case-insensitive comparison
    const aPriority = (a.priority || '').toUpperCase();
    const bPriority = (b.priority || '').toUpperCase();
    
    // First, sort by priority
    const priorityComparison = (priorityMap[aPriority] ?? 999) - (priorityMap[bPriority] ?? 999);
    if (priorityComparison !== 0) return priorityComparison;
    
    // If priorities are the same, sort by progress percentage in descending order
    const aProgress = (a.currentAmt / a.targetAmt) * 100;
    const bProgress = (b.currentAmt / b.targetAmt) * 100;
    return bProgress - aProgress;
  });
};

export default async function OverviewPage() {
  const data = await getDashboardData();
  // Sort goals by priority
  const sortedGoals = sortGoalsByPriority(data.goals);
  
  // Log the priorities to help debug

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Welcome back!</h1>
        <p className="text-muted-foreground text-lg">Here&apos;s your financial overview for today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{formatCurrency(data.totalAssetsValue)}</div>
            <p className="text-xs text-muted-foreground mt-2">Total value after investments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Goal className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.activeGoalsCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Goals in progress</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${data.monthlyGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.monthlyGrowth > 0 ? '+' : ''}{data.monthlyGrowth.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Summary of Goals and Investments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Top Goals</CardTitle>
              <CardDescription>Your highest priority goals</CardDescription>
            </div>
            <AddGoalDialog variant="outline" size="sm" />
          </CardHeader>
          <CardContent>
            {sortedGoals.length > 0 ? (
              <div className="space-y-6">
                {sortedGoals.slice(0, 2).map((goal) => (
                  <div key={goal.id} className="group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{goal.name}</h4>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            goal.priority?.toUpperCase() === 'HIGH' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                              : goal.priority?.toUpperCase() === 'MEDIUM' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>{goal.priority?.toLowerCase()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500 ease-in-out"
                            style={{
                              width: `${Math.min(100, (goal.currentAmt / goal.targetAmt) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{formatCurrency(goal.currentAmt)} / {formatCurrency(goal.targetAmt)}</span>
                          <span className="font-medium">{Math.floor((goal.currentAmt / goal.targetAmt) * 100)}% complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No goals set yet.</p>
                <AddGoalDialog variant="outline" size="sm" className="mt-4" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Top Assets</CardTitle>
              <CardDescription>Your best performing investments</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentAssets.length > 0 ? (
              <div className="space-y-6">
                {data.recentAssets.slice(0, 2).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {asset.name}
                          {asset.symbol && (
                            <span className="text-sm text-muted-foreground">({asset.symbol})</span>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">{asset.type.toLowerCase().replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(asset.currentValue || 0)}</p>
                      {asset.currentValue && asset.purchasePrice && (
                        <p className={`text-sm ${
                          ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) > 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}>
                          {((asset.currentValue - asset.purchasePrice) / asset.purchasePrice * 100).toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No assets added yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 