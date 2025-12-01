import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { companyCategories } from "@/data/company-categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

// Helper to get categories based on account context
function getCategoriesForContext(context) {
  return context === "COMPANY" ? companyCategories : defaultCategories;
}

export default async function AddTransactionPage({ searchParams }) {
  const accountsData = await getUserAccounts();
  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const editId = searchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  // Determine context from initial data or default account
  const defaultAccount = accounts.find((ac) => ac.isDefault);
  const context = initialData
    ? accounts.find((ac) => ac.id === initialData.accountId)?.context || "PERSONAL"
    : defaultAccount?.context || "PERSONAL";

  // Get appropriate categories
  const categories = getCategoriesForContext(context);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5">
      <div className="flex justify-center md:justify-normal mb-8">
    
      <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">Add Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={categories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
