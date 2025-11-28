import { Inter } from "next/font/google";
// import ThirdwebProviderClient from "@/components/ThirdwebProviderClient";
import "./globals.css";
import Header from "../components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CurrencyProvider } from "@/components/currency-provider";


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
        {/* <ThirdwebProviderClient> */}
          <Header />
          <CurrencyProvider>
            <main className="min-h-screen">{children}</main>
          </CurrencyProvider>
          <Toaster richColors />

          {/* <footer className="bg-blue-50/70 border-t border-blue-100 py-6">
            <div className="container mx-auto px-4 flex items-center justify-between text-gray-600 text-sm">
              <p className="font-medium">© 2025 Trackify Finance</p>
              <div className="flex items-center gap-4">
                <a href="/dashboard" className="hover:text-gray-900 transition">Dashboard</a>
                <a href="/account" className="hover:text-gray-900 transition">Accounts</a>
                <a href="/dashboard/settings" className="hover:text-gray-900 transition">Settings</a>
              </div>
            </div>
          </footer> */}
          <AnalyticsProvider />
          {/* </ThirdwebProviderClient> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
