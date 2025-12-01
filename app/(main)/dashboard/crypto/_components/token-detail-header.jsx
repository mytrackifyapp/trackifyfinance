"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function TokenDetailHeader({ token, metadata }) {
  const isPositive = (token.unrealizedPnL || 0) >= 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {metadata?.image && (
              <Image
                src={metadata.image}
                alt={token.symbol}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{token.symbol}</h1>
              <p className="text-muted-foreground">{token.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-2xl font-bold">
              ${(token.currentPrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-lg font-semibold">{token.totalAmount.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold">
              ${(token.currentValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cost Basis</p>
            <p className="text-lg font-semibold">
              ${(token.costBasis || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unrealized P&L</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p className={cn(
                "text-lg font-semibold",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? "+" : ""}${(token.unrealizedPnL || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className={cn(
              "text-sm",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              ({isPositive ? "+" : ""}{(token.unrealizedPnLPercent || 0).toFixed(2)}%)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

