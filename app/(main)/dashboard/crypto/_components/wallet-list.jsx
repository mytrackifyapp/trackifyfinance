"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, RefreshCw, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { syncCryptoWallet, deleteCryptoWallet } from "@/actions/crypto";
import { toast } from "sonner";
import { useState } from "react";

const walletTypeLabels = {
  MANUAL: "Manual",
  BLOCKCHAIN: "Blockchain",
  EXCHANGE_BINANCE: "Binance",
  EXCHANGE_COINBASE: "Coinbase",
  EXCHANGE_OTHER: "Other Exchange",
};

export function WalletList({ wallets = [] }) {
  const [syncing, setSyncing] = useState({});
  const [deleting, setDeleting] = useState({});

  const handleSync = async (walletId) => {
    setSyncing({ ...syncing, [walletId]: true });
    try {
      const result = await syncCryptoWallet(walletId);
      if (result.success) {
        toast.success(`Synced ${result.balancesCount || 0} tokens`);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to sync wallet");
      }
    } catch (error) {
      toast.error("Failed to sync wallet");
    } finally {
      setSyncing({ ...syncing, [walletId]: false });
    }
  };

  const handleDelete = async (walletId) => {
    if (!confirm("Are you sure you want to delete this wallet? This will also delete all associated assets and transactions.")) {
      return;
    }

    setDeleting({ ...deleting, [walletId]: true });
    try {
      const result = await deleteCryptoWallet(walletId);
      if (result.success) {
        toast.success("Wallet deleted");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete wallet");
      }
    } catch (error) {
      toast.error("Failed to delete wallet");
    } finally {
      setDeleting({ ...deleting, [walletId]: false });
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No wallets connected yet.</p>
        <p className="text-sm text-muted-foreground mb-2">Connect a wallet to start tracking your crypto portfolio.</p>
        <p className="text-xs text-muted-foreground">You can connect multiple wallets to track your entire portfolio.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <Card key={wallet.id} className="relative">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{wallet.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {walletTypeLabels[wallet.type] || wallet.type}
                  </Badge>
                </div>
                {!wallet.isActive && (
                  <Badge variant="destructive" className="ml-2">Inactive</Badge>
                )}
              </div>

              {wallet.address && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-mono text-xs break-all">{wallet.address}</p>
                </div>
              )}

              {wallet.chain && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Chain</p>
                  <p className="capitalize">{wallet.chain}</p>
                </div>
              )}

              <div className="text-sm">
                <p className="text-muted-foreground">Assets</p>
                <p className="font-semibold">{wallet.assets?.length || 0} tokens</p>
              </div>

              {wallet.lastSyncedAt && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Last Synced</p>
                  <p>{format(new Date(wallet.lastSyncedAt), "MMM d, yyyy HH:mm")}</p>
                </div>
              )}

              {wallet.syncError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-xs">{wallet.syncError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Link href={`/dashboard/crypto/wallet/${wallet.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                {wallet.type !== "MANUAL" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(wallet.id)}
                    disabled={syncing[wallet.id]}
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing[wallet.id] ? "animate-spin" : ""}`} />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(wallet.id)}
                  disabled={deleting[wallet.id]}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

