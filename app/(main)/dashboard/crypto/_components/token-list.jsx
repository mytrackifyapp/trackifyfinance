"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TokenList({ tokens = [] }) {
  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tokens in your portfolio yet.</p>
        <p className="text-sm mt-2">Add a wallet to get started.</p>
      </div>
    );
  }

  const sortedTokens = [...tokens].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Cost Basis</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTokens.map((token) => {
            const isPositive = (token.unrealizedPnL || 0) >= 0;
            const pnlPercent = token.unrealizedPnLPercent || 0;

            return (
              <TableRow key={token.symbol}>
                <TableCell>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">{token.name}</div>
                  </div>
                </TableCell>
                <TableCell>{token.totalAmount.toFixed(6)}</TableCell>
                <TableCell>
                  ${(token.currentPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </TableCell>
                <TableCell>
                  ${(token.currentValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  ${(token.costBasis || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={cn(
                      "font-medium",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {isPositive ? "+" : ""}${(token.unrealizedPnL || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={cn(
                      "text-sm ml-1",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      ({isPositive ? "+" : ""}{pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/crypto/token/${token.symbol}`}>
                    <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

