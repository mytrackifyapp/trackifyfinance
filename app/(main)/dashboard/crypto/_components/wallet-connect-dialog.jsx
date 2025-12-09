"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConnectWalletButton } from "./connect-wallet-button";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { createCryptoWallet } from "@/actions/crypto";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WalletConnectDialog({ open, onOpenChange }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  useEffect(() => {
    if (account && wallet && open && !savedSuccessfully) {
      // Auto-generate wallet name
      const defaultName = wallet.id 
        ? `${wallet.id.charAt(0).toUpperCase() + wallet.id.slice(1)} Wallet`
        : "Connected Wallet";
      setWalletName(defaultName);
    }
  }, [account, wallet, open, savedSuccessfully]);

  // Reset saved state when dialog closes
  useEffect(() => {
    if (!open) {
      setSavedSuccessfully(false);
      setWalletName("");
    }
  }, [open]);


  const handleSave = async () => {
    if (!account || !wallet) {
      toast.error("Please connect a wallet first");
      return;
    }

    if (!walletName.trim()) {
      toast.error("Please enter a wallet name");
      return;
    }

    setSaving(true);
    try {
      const chainId = wallet.getChain()?.id || 1;
      
      // Map chainId to chain name
      const chainMap = {
        1: "ethereum", // Ethereum Mainnet
        11155111: "ethereum", // Sepolia
        137: "polygon", // Polygon
        8453: "ethereum", // Base
        42161: "ethereum", // Arbitrum
        10: "ethereum", // Optimism
        56: "bsc", // BSC
        43114: "avalanche", // Avalanche
      };

      const chain = chainMap[chainId] || "ethereum";

      const result = await createCryptoWallet({
        name: walletName.trim(),
        type: "BLOCKCHAIN",
        chain: chain,
        address: account.address,
      });

      if (result.success) {
        toast.success("Wallet saved successfully!");
        setSavedSuccessfully(true);
        router.refresh();
        
        // Disconnect the wallet after saving so user can connect another one
        if (wallet) {
          await disconnect(wallet);
        }
        
        // Reset form state
        setWalletName("");
        
        // Reset saved state after 2 seconds and show wallet selection again
        setTimeout(() => {
          setSavedSuccessfully(false);
        }, 2000);
      } else {
        toast.error(result.error || "Failed to save wallet");
        setSavedSuccessfully(false);
      }
    } catch (error) {
      toast.error("Failed to save wallet");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your crypto wallet to track your portfolio. You can connect multiple wallets.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {savedSuccessfully ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ✓ Wallet saved successfully!
                </p>
                <p className="text-xs text-green-700 mb-4">
                  You can now connect another wallet or close this dialog.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSavedSuccessfully(false);
                      setWalletName("");
                    }}
                    className="flex-1"
                  >
                    Connect Another Wallet
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      setSavedSuccessfully(false);
                      setWalletName("");
                    }}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : !account ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose a wallet to connect:
              </p>
              <ConnectWalletButton />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium">Connected Wallet</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (wallet) {
                        await disconnect(wallet);
                        toast.info("Wallet disconnected");
                      }
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Disconnect
                  </Button>
                </div>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {account.address}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Network: {wallet.getChain()?.name || "Unknown"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Wallet Name</label>
                <Input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="My Wallet"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Give this wallet a name to identify it (e.g., &quot;MetaMask Main&quot;, &quot;Coinbase Wallet&quot;)
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setWalletName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !walletName.trim()}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Save Wallet"}
                </Button>
              </div>

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

