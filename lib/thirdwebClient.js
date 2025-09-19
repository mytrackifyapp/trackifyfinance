// lib/thirdwebClient.js
import { createThirdwebClient } from "thirdweb";

// ✅ Export name is "client"
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});
