"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function MonoCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const monoCode = searchParams.get("mono_code");
  const context = searchParams.get("context") || "PERSONAL";
  const provider = searchParams.get("provider");

  useEffect(() => {
    if (monoCode && provider === "mono") {
      handleMonoExchange();
    }
  }, [monoCode, provider]);

  const handleMonoExchange = async () => {
    try {
      const response = await fetch("/api/bank-providers/mono/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: monoCode,
          context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect bank account");
      }

      const data = await response.json();
      
      toast.success(
        `Successfully connected ${data.accounts.length} account(s)`
      );
      
      // Remove query params and refresh
      router.replace("/dashboard/accounting");
      router.refresh();
    } catch (err) {
      console.error("Error exchanging Mono code:", err);
      toast.error(err.message || "Failed to connect bank account");
      router.replace("/dashboard/accounting");
    }
  };

  return null; // This component doesn't render anything
}

