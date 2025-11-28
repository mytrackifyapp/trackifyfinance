import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Calculator, MessageSquare, FileText, Settings, LayoutDashboard, Store, Sparkles } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const MainLayout = async ({ children }) => {
  const { userId } = await auth();
  
  // Only check onboarding for authenticated users accessing dashboard routes
  // The (main) route group includes dashboard routes, so we check here
  if (userId) {
    const user = await checkUser();
    
    // If user doesn't exist yet or onboarding not completed, redirect to onboarding
    // Don't wrap redirect in try-catch - let NEXT_REDIRECT propagate naturally
    // Note: This redirect only happens for routes under (main), which excludes the root "/" page
    if (!user || !user.onboardingCompleted) {
      redirect("/");
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="bg-sidebar">
        <SidebarHeader>
          {/* <div className="px-2 py-1 text-lg font-semibold">Trackify</div> */}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/accounting">
                      <Calculator />
                      <span>Accounting</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/chat">
                      <Sparkles />
                      <span>Finna</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/invoice">
                      <FileText />
                      <span>Invoice</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/seller">
                      <Store />
                      <span>Seller Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto pt-20 sm:pt-24 px-4 overflow-x-hidden">
          <div className="flex items-center gap-3 mb-6">
            <SidebarTrigger className="border border-gray-200 flex-shrink-0" />
            <h1 className="text-xl font-semibold break-words">Menu</h1>
          </div>
          <div className="overflow-x-hidden">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
