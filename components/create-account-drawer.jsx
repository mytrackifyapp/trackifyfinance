"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2, Plus } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";
import { BankConnectionDialog } from "@/components/bank-connection-dialog";

export function CreateAccountDrawer({ children, defaultContext = "PERSONAL" }) {
  const [open, setOpen] = useState(false);
  const [showBankConnection, setShowBankConnection] = useState(false);
  const [connectionContext, setConnectionContext] = useState(defaultContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      context: defaultContext,
      balance: "",
      isDefault: false,
      companyName: "",
      taxId: "",
    },
  });

  const accountContext = watch("context");

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const handleConnectBank = () => {
    setConnectionContext(accountContext);
    setShowBankConnection(true);
    setOpen(false); // Close the drawer
  };

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Account</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {/* Connect Bank Option */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center gap-2 border-2 border-dashed hover:border-primary"
                onClick={handleConnectBank}
              >
                <Building2 className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <p className="font-medium">Connect Bank Account</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically sync transactions and balances
                  </p>
                </div>
              </Button>
            </div>

            <div className="flex items-center gap-4 my-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="context"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Context
              </label>
              <Select
                onValueChange={(value) => {
                  setValue("context", value);
                  // Reset company fields if switching to personal
                  if (value === "PERSONAL") {
                    setValue("companyName", "");
                    setValue("taxId", "");
                  }
                }}
                defaultValue={watch("context")}
              >
                <SelectTrigger id="context">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="COMPANY">Company/Business</SelectItem>
                </SelectContent>
              </Select>
              {errors.context && (
                <p className="text-sm text-red-500">{errors.context.message}</p>
              )}
            </div>

            {accountContext === "COMPANY" && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="companyName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Acme Corp"
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="taxId"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tax ID / EIN (Optional)
                  </label>
                  <Input
                    id="taxId"
                    placeholder="e.g., 12-3456789"
                    {...register("taxId")}
                  />
                  {errors.taxId && (
                    <p className="text-sm text-red-500">{errors.taxId.message}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="balance"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-base font-medium cursor-pointer"
                >
                  Set as Default
                </label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <BankConnectionDialog
        open={showBankConnection}
        onOpenChange={setShowBankConnection}
        context={connectionContext}
        userCountry={null} // You can pass user's country from user profile/settings
      />
    </>
  );
}
