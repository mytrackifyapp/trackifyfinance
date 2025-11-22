"use client";

import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();
  
  // Map paths to their respective titles
  const getTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/dashboard/accounting") return "Accounting";
    if (pathname === "/dashboard/chat") return "Finna";
    if (pathname === "/dashboard/invoice") return "Invoice";
    if (pathname === "/dashboard/seller") return "Seller Dashboard";
    if (pathname === "/dashboard/settings") return "Settings";
    if (pathname === "/dashboard/dictionary") return "Finance Dictionary";
    return "Dashboard"; // fallback
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 px-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-title">
              {getTitle()}
            </h1>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
