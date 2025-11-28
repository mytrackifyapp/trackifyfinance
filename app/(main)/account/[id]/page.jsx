import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { formatCurrency, getStoredCurrency } from "@/lib/currency";

export default async function AccountPage({ params }) {
  const accountData = await getAccountWithTransactions(params.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-4 sm:px-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent capitalize break-words">
            {account.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-left sm:text-right pb-2 flex-shrink-0">
          <div className="text-xl sm:text-2xl font-bold break-words">
            {formatCurrency(parseFloat(account.balance), getStoredCurrency())}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#86efac" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#86efac" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
