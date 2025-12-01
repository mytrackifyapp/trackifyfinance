import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CurrencyProvider } from "@/components/currency-provider";
import { ThirdwebProviderClient } from "@/components/thirdweb-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Trackfiy",
  description: "Personal Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}>

      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThirdwebProviderClient>
            <Header />
            <CurrencyProvider>
              <main className="min-h-screen">{children}</main>
            </CurrencyProvider>
            <Toaster richColors />
            <AnalyticsProvider />
          </ThirdwebProviderClient>
        </body>
      </html>
    </ClerkProvider>
  );
}
