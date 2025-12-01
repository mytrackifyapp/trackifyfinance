"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const transactionTypeColors = {
  BUY: "bg-green-100 text-green-800",
  SELL: "bg-red-100 text-red-800",
  SWAP: "bg-blue-100 text-blue-800",
  TRANSFER_IN: "bg-purple-100 text-purple-800",
  TRANSFER_OUT: "bg-orange-100 text-orange-800",
  STAKE_REWARD: "bg-yellow-100 text-yellow-800",
  FEE: "bg-gray-100 text-gray-800",
};

export function TokenTransactions({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions for this token.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Wallet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                {format(new Date(tx.timestamp), "MMM d, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                <Badge
                  className={transactionTypeColors[tx.type] || "bg-gray-100 text-gray-800"}
                >
                  {tx.type.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>{tx.amount.toFixed(6)}</TableCell>
              <TableCell>
                {tx.price ? `$${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : "-"}
              </TableCell>
              <TableCell>
                ${tx.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {tx.wallet?.name || "Unknown"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

