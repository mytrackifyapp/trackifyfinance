import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { checkUser } from "@/lib/checkUser";
import { AccountCard } from "../_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "../_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { DashboardOverview } from "../_components/transaction-overview";

export default async function AccountingPage() {
  const { userId } = await auth();
  
  // Double-check onboarding status here to prevent errors if layout redirect hasn't completed
  if (userId) {
    const user = await checkUser();
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }
  
  const [accountsData, transactionsData] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  // Ensure arrays are always defined (fallback to empty arrays)
  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const transactions = Array.isArray(transactionsData) ? transactionsData : [];

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {/* Subtitle */}
      <p className="text-muted-foreground text-sm sm:text-base mt-2 mb-2 break-words">
        Manage your accounts, transactions, and budgets
      </p>

      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* Accounts Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Your Accounts</h2>
          <Link href="/account" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5 min-h-[150px]">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          {accounts.length > 0 &&
            accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}

