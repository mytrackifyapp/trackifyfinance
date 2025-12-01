"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCryptoTransaction } from "@/actions/crypto";
import { toast } from "sonner";

const transactionSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  tokenName: z.string().optional(),
  type: z.enum(["BUY", "SELL", "SWAP", "TRANSFER_IN", "TRANSFER_OUT", "STAKE_REWARD", "FEE", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
  price: z.number().optional(),
  totalValue: z.number().optional(),
  fee: z.number().optional(),
  feeToken: z.string().optional(),
  timestamp: z.string().optional(),
});

export function AddTransactionDialog({ open, onOpenChange, wallets = [] }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      timestamp: new Date().toISOString().slice(0, 16),
    },
  });

  const transactionType = watch("type");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await createCryptoTransaction({
        ...data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      });
      if (result.success) {
        toast.success("Transaction added successfully");
        reset();
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to add transaction");
      }
    } catch (error) {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Crypto Transaction</DialogTitle>
          <DialogDescription>
            Record a new crypto transaction manually
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Wallet</label>
            <Select
              onValueChange={(value) => setValue("walletId", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.walletId && (
              <p className="text-sm text-red-500 mt-1">{errors.walletId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Token Symbol</label>
              <Input
                {...register("tokenSymbol")}
                placeholder="BTC, ETH, etc."
                className="mt-1"
              />
              {errors.tokenSymbol && (
                <p className="text-sm text-red-500 mt-1">{errors.tokenSymbol.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Token Name (optional)</label>
              <Input
                {...register("tokenName")}
                placeholder="Bitcoin, Ethereum, etc."
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Transaction Type</label>
            <Select
              value={transactionType}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">Buy</SelectItem>
                <SelectItem value="SELL">Sell</SelectItem>
                <SelectItem value="SWAP">Swap</SelectItem>
                <SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
                <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                <SelectItem value="STAKE_REWARD">Stake Reward</SelectItem>
                <SelectItem value="FEE">Fee</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="0.00"
                className="mt-1"
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Price per Token (optional)</label>
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Total Value (optional)</label>
              <Input
                {...register("totalValue", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date & Time</label>
              <Input
                {...register("timestamp")}
                type="datetime-local"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

