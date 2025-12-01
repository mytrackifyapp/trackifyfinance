"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";

export function ThirdwebProviderClient({ children }) {
  return (
    <ThirdwebProvider client={client}>
      {children}
    </ThirdwebProvider>
  );
}

