// components/ThirdwebProviderClient.jsx
"use client";

import React from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient"; // ✅ must match export name

export default function ThirdwebProviderClient({ children }) {
  return <ThirdwebProvider client={client}>{children}</ThirdwebProvider>;
}
