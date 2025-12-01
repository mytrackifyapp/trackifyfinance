import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { checkUser } from "@/lib/checkUser";
import { AccountingTabs } from "./_components/accounting-tabs";

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

  return (
    <div className="space-y-8">
      {/* Subtitle */}
      <p className="text-muted-foreground text-sm sm:text-base mt-2 mb-2 break-words">
        Manage your personal and business accounts, transactions, and budgets
      </p>

      {/* Accounting Tabs */}
      <AccountingTabs accounts={accounts} transactions={transactions} />
    </div>
  );
}

