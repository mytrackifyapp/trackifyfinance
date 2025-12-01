"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTransactionDialog } from "./add-transaction-dialog";

export function AddTransactionButton({ wallets = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Transaction
      </Button>
      <AddTransactionDialog open={open} onOpenChange={setOpen} wallets={wallets} />
    </>
  );
}

