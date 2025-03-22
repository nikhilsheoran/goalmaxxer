import { UserButton } from "@clerk/nextjs";
import ChatPanel from "@/app/components/ChatPanel";
import { ChartBar, Target, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import OverviewPage from "./overview/page";
import GoalsPage from "./goals/page";
import InvestmentsPage from "./investments/page";

export default async function Dashboard() {
  return (
    <div className="flex h-screen w-full">
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

        <div className="container py-6 space-y-6 px-4">
          {/* Mini Navbar with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <ChartBar className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </TabsTrigger>
              <TabsTrigger value="investments" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Investments</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <OverviewPage />
            </TabsContent>
            
            <TabsContent value="goals">
              <GoalsPage />
            </TabsContent>
            
            <TabsContent value="investments">
              <InvestmentsPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-[400px]">
        <ChatPanel />
      </div>
    </div>
  );
}