"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

const transactionTypeColors = {
  BUY: "bg-green-100 text-green-800",
  SELL: "bg-red-100 text-red-800",
  SWAP: "bg-blue-100 text-blue-800",
  TRANSFER_IN: "bg-purple-100 text-purple-800",
  TRANSFER_OUT: "bg-orange-100 text-orange-800",
  STAKE_REWARD: "bg-yellow-100 text-yellow-800",
  FEE: "bg-gray-100 text-gray-800",
};

export function WalletTransactions({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions in this wallet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 10).map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  {format(new Date(tx.timestamp), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    className={transactionTypeColors[tx.type] || "bg-gray-100 text-gray-800"}
                  >
                    {tx.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/crypto/token/${tx.tokenSymbol}`} className="hover:underline">
                    {tx.tokenSymbol}
                  </Link>
                </TableCell>
                <TableCell>{tx.amount.toFixed(6)}</TableCell>
                <TableCell>
                  ${tx.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {transactions.length > 10 && (
        <div className="mt-4 text-center">
          <Link href="/dashboard/crypto/trades">
            <span className="text-sm text-muted-foreground hover:underline">
              View all transactions →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

