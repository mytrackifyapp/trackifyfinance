import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { checkUser } from "@/lib/checkUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Sparkles, 
  Store, 
  TrendingUp, 
  Wallet,
  ArrowRight,
  Receipt,
  BarChart3,
  Calculator,
  BookOpen
} from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
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

  // Calculate quick stats
  const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
  const monthlyIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between mt-2 mb-2">
        <p className="text-muted-foreground text-sm sm:text-base break-words">
          Here's an overview of your financial dashboard
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? "text-green-600" : "text-red-600"}`}>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(monthlyIncome - monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Feature Cards & Dictionary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/accounting" className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-500 h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Accounting</CardTitle>
                  <CardDescription>Manage accounts & transactions</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your accounts, transactions, budgets, and financial analytics
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/chat" className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-[#C1FF72] h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#C1FF72] to-[#A8E063] flex items-center justify-center">
                  <Image 
                    src="/finna.png" 
                    alt="Finna" 
                    width={32} 
                    height={32} 
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Finna AI</CardTitle>
                  <CardDescription>Your intelligent financial assistant</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#C1FF72] transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get instant insights, personalized suggestions, and answers to your financial questions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/invoice" className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-green-500 h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Invoices</CardTitle>
                  <CardDescription>Create professional invoices</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate smart invoices with payment details and track your billing
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/seller" className="lg:col-span-1">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-purple-500 h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Seller Dashboard</CardTitle>
                  <CardDescription>List and sell digital products</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create product listings and receive payments for your digital products
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Finance Dictionary Preview */}
      <div className="mt-12">
        <Link href="/dashboard/dictionary">
          <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-[#C1FF72] bg-gradient-to-br from-[#C1FF72]/5 to-[#A8E063]/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#C1FF72] to-[#A8E063] flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg ">Finance Dictionary</CardTitle>
                <CardDescription>Browse finance, crypto, startup & business terms</CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#C1FF72] transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quick reference for financial terminology. Search through 60+ terms across finance, crypto, startups, and business.
            </p>
          </CardContent>
        </Card>
        </Link>
      </div>
    </div>
  );
}
