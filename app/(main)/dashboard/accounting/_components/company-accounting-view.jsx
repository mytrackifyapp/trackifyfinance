"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "../../_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "../../_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { CompanyDashboardOverview } from "./company-dashboard-overview";

export function CompanyAccountingView({ accounts, transactions }) {
  const defaultAccount = accounts?.find((account) => account.isDefault);
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    const fetchBudget = async () => {
      if (defaultAccount) {
        const data = await getCurrentBudget(defaultAccount.id);
        setBudgetData(data);
      }
    };
    fetchBudget();
  }, [defaultAccount]);

  // Calculate company metrics
  const totalRevenue = transactions
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8">
      {/* Company Dashboard Overview */}
      <CompanyDashboardOverview
        accounts={accounts}
        transactions={transactions || []}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
      />

      {/* Budget Progress */}
      {budgetData && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Accounts Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Business Accounts</h2>
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
                <p className="text-sm font-medium">Add Business Account</p>
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
