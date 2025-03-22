import { UserButton } from "@clerk/nextjs";
import ChatPanel from "@/app/components/ChatPanel";
import { ArrowUpRight, Goal, Wallet, Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDashboardData } from "@/app/actions/serverActions";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background/50">
        <header className="sticky top-0 z-40 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/goalmaxxer-dark.png"
                  alt="GoalMaxxer Logo"
                  width={140}
                  height={35}
                  className="hidden dark:block"
                />
                <Image
                  src="/goalmaxxer-light.png"
                  alt="GoalMaxxer Logo"
                  width={140}
                  height={35}
                  className="block dark:hidden"
                />
              </Link>
            </div>
            <UserButton />
          </div>
        </header>

        <div className="container py-6 space-y-8 px-4">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">Here's your financial overview.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.totalAssetsValue)}</div>
                <p className="text-xs text-muted-foreground">Across all accounts</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Goal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.activeGoalsCount}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.monthlyGrowth.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals Section */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Goals</CardTitle>
                  <CardDescription>Track and manage your financial goals</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.goals.length > 0 ? (
                <div className="space-y-6">
                  {data.goals.map((goal) => (
                    <div key={goal.id} className="group">
                      <div className="flex items-center gap-4">
                        <Target className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{goal.name}</h4>
                            <span className="text-sm text-muted-foreground capitalize">{goal.priority.toLowerCase()}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (goal.currentAmt / goal.targetAmt) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{formatCurrency(goal.currentAmt)}</span>
                            <span>{formatCurrency(goal.targetAmt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No goals set yet.</p>
                  <p className="text-sm text-muted-foreground">Start by creating your first financial goal!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assets Section */}
          <Card className="hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investment Portfolio</CardTitle>
                  <CardDescription>Overview of your assets and performance</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentAssets.length > 0 ? (
                <div className="space-y-4">
                  {data.recentAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {asset.name}
                            {asset.symbol && (
                              <span className="text-sm text-muted-foreground">
                                ({asset.symbol})
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground capitalize">{asset.type.toLowerCase().replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(asset.currentValue || 0)}</p>
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
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assets added yet.</p>
                  <p className="text-sm text-muted-foreground">Connect your accounts to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-[400px]">
        <ChatPanel />
      </div>
    </div>
  );
}