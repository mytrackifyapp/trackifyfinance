"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard, Building2, RefreshCw, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { syncPlaidAccount, disconnectPlaidAccount } from "@/actions/plaid";
import { toast } from "sonner";
import { useCurrency } from "@/components/currency-provider";

export function AccountCard({ account }) {
  const { 
    name, 
    type, 
    balance, 
    id, 
    isDefault, 
    context, 
    companyName,
    isBankConnected,
    plaidInstitutionName,
    lastSyncedAt,
    syncError,
  } = account;
  const { format } = useCurrency();

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const {
    loading: syncLoading,
    fn: syncFn,
    data: syncData,
    error: syncFetchError,
  } = useFetch(syncPlaidAccount);

  const {
    loading: disconnectLoading,
    fn: disconnectFn,
    data: disconnectData,
    error: disconnectError,
  } = useFetch(disconnectPlaidAccount);

  const [syncing, setSyncing] = useState(false);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  useEffect(() => {
    if (syncData?.success) {
      toast.success(
        `Synced ${syncData.transactionsCreated} new transactions. Balance updated.`
      );
      setSyncing(false);
      window.location.reload();
    }
  }, [syncData]);

  useEffect(() => {
    if (syncFetchError) {
      toast.error(syncFetchError.message || "Failed to sync account");
      setSyncing(false);
    }
  }, [syncFetchError]);

  useEffect(() => {
    if (disconnectData?.success) {
      toast.success("Bank account disconnected");
      window.location.reload();
    }
  }, [disconnectData]);

  useEffect(() => {
    if (disconnectError) {
      toast.error(disconnectError.message || "Failed to disconnect account");
    }
  }, [disconnectError]);

  const handleSync = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSyncing(true);
    await syncFn(id);
  };

  const handleDisconnect = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to disconnect this bank account? Transactions will remain, but automatic syncing will stop.")) {
      await disconnectFn(id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium capitalize">
                {name}
              </CardTitle>
              {isBankConnected && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Bank
                </Badge>
              )}
              {context === "COMPANY" && (
                <Badge variant="secondary" className="text-xs">
                  Business
                </Badge>
              )}
            </div>
            {isBankConnected && plaidInstitutionName && (
              <p className="text-xs text-muted-foreground mt-1">
                {plaidInstitutionName}
                {lastSyncedAt && (
                  <span className="ml-2">
                    • Synced {new Date(lastSyncedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            )}
            {syncError && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {syncError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isBankConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleSync}
                    disabled={syncLoading || syncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    disabled={disconnectLoading}
                    className="text-destructive"
                  >
                    Disconnect Bank
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {format(parseFloat(balance))}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
            {companyName && ` • ${companyName}`}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
