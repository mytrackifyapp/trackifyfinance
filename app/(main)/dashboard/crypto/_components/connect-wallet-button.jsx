"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { wallets } from "@/lib/thirdwebWallets";
import { ConnectButton } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { createCryptoWallet } from "@/actions/crypto";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ConnectWalletButton({ onWalletConnected }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account && wallet && onWalletConnected) {
      handleSaveWallet(account.address, wallet.getChain()?.id || 1);
    }
  }, [account, wallet]);

  const handleSaveWallet = async (address, chainId) => {
    if (saving) return;
    
    setSaving(true);
    try {
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
      const walletName = wallet.id || "Connected Wallet";

      const result = await createCryptoWallet({
        name: walletName,
        type: "BLOCKCHAIN",
        chain: chain,
        address: address,
      });

      if (result.success) {
        toast.success("Wallet connected and saved!");
        router.refresh();
        if (onWalletConnected) {
          onWalletConnected(result.data);
        }
      } else {
        toast.error(result.error || "Failed to save wallet");
      }
    } catch (error) {
      toast.error("Failed to save wallet");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (account && wallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect(wallet)}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      connectButton={{
        label: "Connect Wallet",
      }}
      connectModal={{
        size: "compact",
      }}
    />
  );
}

