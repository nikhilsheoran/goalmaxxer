import { Target, Plus, Calendar, AlertTriangle, Home, GraduationCap, BadgePercent, Map, Car, Heart, ShieldAlert, BanknoteIcon, Briefcase, Stethoscope, HandHeart, LandmarkIcon, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/app/actions/serverActions";
import { formatCurrency } from "@/lib/utils";
import { AddGoalDialog } from "@/app/components/AddGoalDialog";
import { ViewGoalDialog } from "@/app/components/ViewGoalDialog";

// Map of category to icon
const categoryIcons = {
  home: Home,
  education: GraduationCap,
  retirement: BadgePercent,
  travel: Map,
  car: Car,
  wedding: Heart,
  emergency_fund: ShieldAlert,
  debt_repayment: BanknoteIcon,
  business: Briefcase,
  health: Stethoscope,
  charity: HandHeart,
  inheritance: LandmarkIcon,
  other: HelpCircle,
};

// Helper function to sort goals by priority
const sortGoalsByPriority = (goals) => {
  // Create a prioritized array to ensure proper sorting order
  const priorityMap = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
  
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

export default async function GoalsPage() {
  const data = await getDashboardData();
  // Sort goals by priority
  const sortedGoals = sortGoalsByPriority(data.goals);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Financial Goals</h1>
        <p className="text-muted-foreground text-lg">Track and manage your progress towards financial goals.</p>
      </div>
      
      <div className="flex justify-end">
        <AddGoalDialog variant="default" size="default" className="w-auto" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedGoals.length > 0 ? (
          sortedGoals.map((goal) => {
            // Get the first keyword or default to 'other'
            const category = goal.keywords && goal.keywords.length > 0 ? goal.keywords[0] : 'other';
            // Get the icon component for the category
            const IconComponent = categoryIcons[category] || Target;
            
            return (
              <Card key={goal.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4 md:w-1/3">
                      <div className="p-2 bg-primary/10 rounded-full mt-1">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(goal.targetDate).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          goal.priority?.toUpperCase() === 'HIGH' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : goal.priority?.toUpperCase() === 'MEDIUM' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {goal.priority?.toLowerCase()} priority
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Current Amount</p>
                          <p className="text-lg font-semibold">{formatCurrency(goal.currentAmt)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-sm text-muted-foreground">Target Amount</p>
                          <p className="text-lg font-semibold">{formatCurrency(goal.targetAmt)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{Math.floor((goal.currentAmt / goal.targetAmt) * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500 ease-in-out"
                            style={{
                              width: `${Math.min(100, (goal.currentAmt / goal.targetAmt) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <ViewGoalDialog goal={goal} />
                      </div>

                      {goal.currentAmt < goal.targetAmt * 0.5 && new Date(goal.targetDate) < new Date(Date.now() + 7776000000) && (
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                          <AlertTriangle className="h-4 w-4" />
                          <p className="text-sm">You're behind schedule. Consider increasing your monthly contribution.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-6">Start by creating your first financial goal!</p>
              <AddGoalDialog variant="default" size="default" className="w-auto" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 