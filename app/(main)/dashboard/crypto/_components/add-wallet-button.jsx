"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Wallet, Building2 } from "lucide-react";
import { WalletConnectDialog } from "./wallet-connect-dialog";
import { AddWalletDialog } from "./add-wallet-dialog";

export function AddWalletButton() {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setWalletDialogOpen(true)}>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExchangeDialogOpen(true)}>
            <Building2 className="h-4 w-4 mr-2" />
            Connect Exchange
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <WalletConnectDialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen} />
      <AddWalletDialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen} />
    </>
  );
}

