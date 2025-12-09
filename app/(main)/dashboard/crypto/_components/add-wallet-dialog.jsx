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
import { createCryptoWallet } from "@/actions/crypto";
import { toast } from "sonner";

const walletSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["MANUAL", "BLOCKCHAIN", "EXCHANGE_BINANCE", "EXCHANGE_COINBASE", "EXCHANGE_OTHER"]),
  chain: z.string().optional(),
  address: z.string().optional(),
  exchangeName: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  apiPassphrase: z.string().optional(),
});

export function AddWalletDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      type: "EXCHANGE_BINANCE",
    },
  });

  const walletType = watch("type");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await createCryptoWallet(data);
      if (result.success) {
        toast.success("Wallet added successfully");
        reset();
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to add wallet");
      }
    } catch (error) {
      toast.error("Failed to add wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Exchange</DialogTitle>
          <DialogDescription>
            Connect your exchange account using API keys to track your crypto portfolio
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Wallet Name</label>
            <Input
              {...register("name")}
              placeholder="e.g., My Binance, Hardware Wallet"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Wallet Type</label>
            <Select
              value={walletType}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXCHANGE_BINANCE">Binance Exchange</SelectItem>
                <SelectItem value="EXCHANGE_COINBASE">Coinbase Exchange</SelectItem>
                <SelectItem value="EXCHANGE_OTHER">Other Exchange</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {walletType === "BLOCKCHAIN" && (
            <>
              <div>
                <label className="text-sm font-medium">Blockchain Network</label>
                <Select
                  onValueChange={(value) => setValue("chain", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Wallet Address</label>
                <Input
                  {...register("address")}
                  placeholder="0x..."
                  className="mt-1"
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>
            </>
          )}

          {(walletType === "EXCHANGE_BINANCE" || walletType === "EXCHANGE_COINBASE") && (
            <>
              <div>
                <label className="text-sm font-medium">API Key</label>
                <Input
                  {...register("apiKey")}
                  type="password"
                  placeholder="Enter API key"
                  className="mt-1"
                />
                {errors.apiKey && (
                  <p className="text-sm text-red-500 mt-1">{errors.apiKey.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">API Secret</label>
                <Input
                  {...register("apiSecret")}
                  type="password"
                  placeholder="Enter API secret"
                  className="mt-1"
                />
                {errors.apiSecret && (
                  <p className="text-sm text-red-500 mt-1">{errors.apiSecret.message}</p>
                )}
              </div>
              {walletType === "EXCHANGE_COINBASE" && (
                <div>
                  <label className="text-sm font-medium">API Passphrase</label>
                  <Input
                    {...register("apiPassphrase")}
                    type="password"
                    placeholder="Enter API passphrase"
                    className="mt-1"
                  />
                  {errors.apiPassphrase && (
                    <p className="text-sm text-red-500 mt-1">{errors.apiPassphrase.message}</p>
                  )}
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-1">
                  How to get your {walletType === "EXCHANGE_BINANCE" ? "Binance" : "Coinbase"} API keys:
                </p>
                {walletType === "EXCHANGE_BINANCE" ? (
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Log in to your Binance account</li>
                    <li>Go to API Management in your account settings</li>
                    <li>Create a new API key with &quot;Read&quot; permissions only</li>
                    <li>Copy your API Key and Secret Key</li>
                    <li>Paste them here (they will be encrypted)</li>
                  </ol>
                ) : (
                  <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Log in to your Coinbase account</li>
                    <li>Go to API settings</li>
                    <li>Create a new API key with &quot;View&quot; permissions only</li>
                    <li>Copy your API Key, Secret, and Passphrase</li>
                    <li>Paste them here (they will be encrypted)</li>
                  </ol>
                )}
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  ⚠️ Only enable READ permissions. Never enable trading or withdrawal permissions.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API credentials are encrypted and stored securely. Only read permissions are required.
              </p>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Wallet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

