import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import DashboardPage from "./page"
import { BarLoader } from "react-spinners"
import { Suspense } from "react"

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar (collapsible, managed by SidebarProvider) */}
        <AppSidebar />

        {/* Main content area */}
        <main className="flex-1 px-5">
          {/* Sidebar toggle button (useful on mobile or collapsed state) */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-title">
                Dashboard
              </h1>
            </div>
          </div>

          <Suspense
            fallback={
              <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
            }
          >
            <DashboardPage />
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
}
