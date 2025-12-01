"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { syncCryptoWallet } from "@/actions/crypto";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";

const walletTypeLabels = {
  MANUAL: "Manual",
  BLOCKCHAIN: "Blockchain",
  EXCHANGE_BINANCE: "Binance",
  EXCHANGE_COINBASE: "Coinbase",
  EXCHANGE_OTHER: "Other Exchange",
};

export function WalletDetailHeader({ wallet }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncCryptoWallet(wallet.id);
      if (result.success) {
        toast.success(`Synced ${result.balancesCount || 0} tokens`);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to sync wallet");
      }
    } catch (error) {
      toast.error("Failed to sync wallet");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{wallet.name}</h1>
              <Badge variant="outline">
                {walletTypeLabels[wallet.type] || wallet.type}
              </Badge>
              {!wallet.isActive && (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            {wallet.address && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-mono text-xs break-all">{wallet.address}</p>
              </div>
            )}
            {wallet.chain && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Chain</p>
                <p className="capitalize">{wallet.chain}</p>
              </div>
            )}
            {wallet.lastSyncedAt && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Last Synced</p>
                <p className="text-sm">{format(new Date(wallet.lastSyncedAt), "MMM d, yyyy HH:mm")}</p>
              </div>
            )}
            {wallet.syncError && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p>{wallet.syncError}</p>
              </div>
            )}
          </div>
          {wallet.type !== "MANUAL" && (
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

