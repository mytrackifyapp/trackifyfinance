import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";
import { getCryptoTransactions, getCryptoWallets } from "@/actions/crypto";
import { TransactionTable } from "../_components/transaction-table";
import { AddTransactionButton } from "../_components/add-transaction-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CryptoTradesPage({ searchParams }) {
  const { userId } = await auth();
  
  if (userId) {
    const user = await checkUser();
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }

  const filters = {
    walletId: searchParams?.walletId,
    tokenSymbol: searchParams?.token,
    type: searchParams?.type,
    startDate: searchParams?.startDate,
    endDate: searchParams?.endDate,
  };

  const [transactions, wallets] = await Promise.all([
    getCryptoTransactions(filters),
    getCryptoWallets(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Crypto Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your crypto transaction history
          </p>
        </div>
        <AddTransactionButton wallets={wallets} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={transactions} wallets={wallets} />
        </CardContent>
      </Card>
    </div>
  );
}

