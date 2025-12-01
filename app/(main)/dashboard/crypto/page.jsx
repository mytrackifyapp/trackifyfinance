import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getCryptoPortfolio, getCryptoWallets } from "@/actions/crypto";
import { CryptoDashboardOverview } from "./_components/crypto-dashboard-overview";
import { PortfolioChart } from "./_components/portfolio-chart";
import { AllocationChart } from "./_components/allocation-chart";
import { RecentTransactions } from "./_components/recent-transactions";
import { TokenList } from "./_components/token-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function CryptoDashboardPage() {
  const { userId } = await auth();
  
  if (userId) {
    const user = await checkUser();
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }

  const [portfolio, wallets] = await Promise.all([
    getCryptoPortfolio(),
    getCryptoWallets(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Crypto Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage your cryptocurrency investments across all connected wallets
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/crypto/wallets">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </Link>
        </div>
      </div>

      {/* Portfolio Overview */}
      <CryptoDashboardOverview portfolio={portfolio} />

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value History</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Token Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationChart tokens={portfolio.tokens || []} />
          </CardContent>
        </Card>
      </div>

      {/* Token Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Token Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <TokenList tokens={portfolio.tokens || []} />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/dashboard/crypto/trades">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <RecentTransactions transactions={portfolio.recentTransactions || []} />
        </CardContent>
      </Card>
    </div>
  );
}

