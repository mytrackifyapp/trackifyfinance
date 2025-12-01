export const companyCategories = [
  // Company Income Categories
  {
    id: "sales",
    name: "Sales Revenue",
    type: "INCOME",
    color: "#22c55e", // green-500
    icon: "TrendingUp",
  },
  {
    id: "service-revenue",
    name: "Service Revenue",
    type: "INCOME",
    color: "#06b6d4", // cyan-500
    icon: "Briefcase",
  },
  {
    id: "product-sales",
    name: "Product Sales",
    type: "INCOME",
    color: "#6366f1", // indigo-500
    icon: "Package",
  },
  {
    id: "subscription",
    name: "Subscription Revenue",
    type: "INCOME",
    color: "#ec4899", // pink-500
    icon: "Repeat",
  },
  {
    id: "consulting",
    name: "Consulting Fees",
    type: "INCOME",
    color: "#f59e0b", // amber-500
    icon: "Users",
  },
  {
    id: "other-revenue",
    name: "Other Revenue",
    type: "INCOME",
    color: "#64748b", // slate-500
    icon: "DollarSign",
  },

  // Company Expense Categories
  {
    id: "office-rent",
    name: "Office Rent",
    type: "EXPENSE",
    color: "#ef4444", // red-500
    icon: "Building",
    subcategories: ["Rent", "Utilities", "Maintenance"],
  },
  {
    id: "salaries",
    name: "Salaries & Wages",
    type: "EXPENSE",
    color: "#f97316", // orange-500
    icon: "Users",
    subcategories: ["Employee Salaries", "Contractors", "Bonuses"],
  },
  {
    id: "marketing",
    name: "Marketing & Advertising",
    type: "EXPENSE",
    color: "#84cc16", // lime-500
    icon: "Megaphone",
    subcategories: ["Digital Ads", "Print Ads", "Social Media", "Events"],
  },
  {
    id: "software",
    name: "Software & Subscriptions",
    type: "EXPENSE",
    color: "#06b6d4", // cyan-500
    icon: "Laptop",
    subcategories: ["SaaS Tools", "Licenses", "Cloud Services"],
  },
  {
    id: "equipment",
    name: "Equipment & Supplies",
    type: "EXPENSE",
    color: "#8b5cf6", // violet-500
    icon: "Wrench",
    subcategories: ["Computers", "Office Supplies", "Furniture"],
  },
  {
    id: "travel",
    name: "Business Travel",
    type: "EXPENSE",
    color: "#0ea5e9", // sky-500
    icon: "Plane",
    subcategories: ["Flights", "Hotels", "Meals", "Transportation"],
  },
  {
    id: "professional-services",
    name: "Professional Services",
    type: "EXPENSE",
    color: "#14b8a6", // teal-500
    icon: "Briefcase",
    subcategories: ["Legal", "Accounting", "Consulting"],
  },
  {
    id: "insurance",
    name: "Business Insurance",
    type: "EXPENSE",
    color: "#64748b", // slate-500
    icon: "Shield",
    subcategories: ["Liability", "Property", "Health Insurance"],
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#06b6d4", // cyan-500
    icon: "Zap",
    subcategories: ["Electricity", "Water", "Internet", "Phone"],
  },
  {
    id: "taxes",
    name: "Taxes & Fees",
    type: "EXPENSE",
    color: "#fb7185", // rose-400
    icon: "Receipt",
    subcategories: ["Income Tax", "Sales Tax", "Business License", "Filing Fees"],
  },
  {
    id: "shipping",
    name: "Shipping & Delivery",
    type: "EXPENSE",
    color: "#f43f5e", // rose-500
    icon: "Truck",
    subcategories: ["Postage", "Courier", "Freight"],
  },
  {
    id: "maintenance",
    name: "Maintenance & Repairs",
    type: "EXPENSE",
    color: "#f59e0b", // amber-500
    icon: "Wrench",
    subcategories: ["Equipment", "Facilities", "Vehicles"],
  },
  {
    id: "training",
    name: "Training & Development",
    type: "EXPENSE",
    color: "#6366f1", // indigo-500
    icon: "GraduationCap",
    subcategories: ["Courses", "Conferences", "Workshops"],
  },
  {
    id: "bank-fees",
    name: "Bank & Finance Fees",
    type: "EXPENSE",
    color: "#94a3b8", // slate-400
    icon: "CreditCard",
    subcategories: ["Transaction Fees", "Interest", "Service Charges"],
  },
  {
    id: "other-business-expense",
    name: "Other Business Expenses",
    type: "EXPENSE",
    color: "#94a3b8", // slate-400
    icon: "MoreHorizontal",
  },
];

export const companyCategoryColors = companyCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});

