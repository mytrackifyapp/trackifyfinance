"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TokenHoldings({ token }) {
  if (!token.wallets || token.wallets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No holdings data available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Wallet</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Cost Basis</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {token.wallets.map((wallet, index) => (
            <TableRow key={index}>
              <TableCell>{wallet.walletName}</TableCell>
              <TableCell>{wallet.amount.toFixed(6)}</TableCell>
              <TableCell>
                ${(wallet.averageCost * wallet.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                ${((token.currentPrice || 0) * wallet.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

