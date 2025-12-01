"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import { useCurrency } from "@/components/currency-provider";

export function CompanyDashboardOverview({
  accounts,
  transactions,
  totalRevenue,
  totalExpenses,
  netProfit,
}) {
  const { format } = useCurrency();

  // Calculate account balances
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance || 0),
    0
  );

  // Calculate monthly metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        tx.type === "INCOME" &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const monthlyExpenses = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        tx.type === "EXPENSE" &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{format(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            This month: {format(monthlyRevenue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{format(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            This month: {format(monthlyExpenses)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              netProfit >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {format(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            This month: {format(monthlyProfit)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Receipt className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{format(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

