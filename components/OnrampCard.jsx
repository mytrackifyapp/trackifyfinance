
// "use client";

// import React from "react";
// import { ExternalLink } from "lucide-react";
// import { BuyWidget, PayEmbed } from "thirdweb/react"; // adjust import if needed
// import { client } from "@/lib/thirdwebClient";
// import { formatEther } from "ethers";

// function formatWeiToEth(wei) {
//   try {
//     return formatEther(wei ?? "0");
//   } catch {
//     const n = Number(wei) / 1e18;
//     return n.toFixed(6);
//   }
// }

// export default function OnrampCard({ action }) {
//   const data = action?.data || {};

//   const fiatAmount =
//     data.fiatAmount ||
//     data.fiat_amount ||
//     data.amountFiat ||
//     null;

//   const cryptoAmountWei =
//     data.cryptoAmountWei ||
//     data.crypto_amount_wei ||
//     data.valueWei ||
//     data.amountWei ||
//     null;

//   const cryptoAmount = cryptoAmountWei
//     ? formatWeiToEth(cryptoAmountWei)
//     : (data.cryptoAmount || data.amountCrypto || null);

//   const tokenAddress = data.tokenAddress || null;
//   const chain = data.chain || null;

//   // If PayEmbed is available & you know token + chain, use widget
//   if (PayEmbed && tokenAddress && chain) {
//     return (
//       <div className="p-4 border rounded-lg bg-white shadow-md max-w-md">
//         <h3 className="text-lg font-semibold">Buy Crypto</h3>
//         {fiatAmount && (
//           <p className="mt-2 text-gray-600">
//             Amount: <strong>${fiatAmount}</strong>
//           </p>
//         )}
//         {cryptoAmount && (
//           <p className="mt-2 text-gray-600">
//             Estimated to receive: <strong>{cryptoAmount} tokens</strong>
//           </p>
//         )}
//         <div className="mt-4">
//           <PayEmbed
//             client={client}
//             payOptions={{
//               mode: "deposit", // or "direct_payment" depending on docs
//               paymentInfo: {
//                 amount: fiatAmount ? fiatAmount.toString() : "10",
//                 token: tokenAddress,
//                 chain: chain,
//               },
//             }}
//             // optional: set style/theme
//           />
//         </div>
//       </div>
//     );
//   }

//   // Fallback: if no PayEmbed or missing token/chain, use a simple link if present
//   const checkoutUrl =
//     data.checkoutUrl ||
//     data.checkout_url ||
//     action?.url ||
//     null;

//   const safeUrl = typeof checkoutUrl === "string" && checkoutUrl.startsWith("https://") ? checkoutUrl : null;

//   return (
//     <div className="p-4 border rounded-lg bg-white shadow-md max-w-md">
//       <h3 className="text-lg font-semibold">Buy Crypto</h3>
//       {fiatAmount && <p className="mt-2 text-gray-600">Amount: <strong>${fiatAmount}</strong></p>}
//       {cryptoAmount && <p className="mt-2 text-gray-600">Estimated to receive: <strong>{cryptoAmount}</strong></p>}
//       <div className="mt-4">
//         {safeUrl ? (
//           <a
//             href={safeUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
//           >
//             Proceed to Checkout <ExternalLink size={16} />
//           </a>
//         ) : (
//           <div className="text-sm text-red-500">Checkout option unavailable</div>
//         )}
//       </div>
//     </div>
//   );
// }
