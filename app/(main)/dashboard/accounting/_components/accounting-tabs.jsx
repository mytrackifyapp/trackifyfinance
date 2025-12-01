"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalAccountingView } from "./personal-accounting-view";
import { CompanyAccountingView } from "./company-accounting-view";

export function AccountingTabs({ accounts, transactions }) {
  const [activeTab, setActiveTab] = useState("personal");

  // Separate accounts and transactions by context
  const personalAccounts = accounts.filter((acc) => acc.context === "PERSONAL" || !acc.context);
  const companyAccounts = accounts.filter((acc) => acc.context === "COMPANY");
  
  const personalTransactions = transactions.filter((tx) => {
    const account = accounts.find((acc) => acc.id === tx.accountId);
    return account?.context === "PERSONAL" || !account?.context;
  });
  
  const companyTransactions = transactions.filter((tx) => {
    const account = accounts.find((acc) => acc.id === tx.accountId);
    return account?.context === "COMPANY";
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="company">Company</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal" className="mt-6">
        <PersonalAccountingView
          accounts={personalAccounts}
          transactions={personalTransactions}
        />
      </TabsContent>
      
      <TabsContent value="company" className="mt-6">
        <CompanyAccountingView
          accounts={companyAccounts}
          transactions={companyTransactions}
        />
      </TabsContent>
    </Tabs>
  );
}

