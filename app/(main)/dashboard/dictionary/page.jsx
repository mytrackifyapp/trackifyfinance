"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const GLOSSARY_TERMS = [
  // Finance Terms
  {
    term: "Asset",
    definition: "Any resource owned by a business or individual that has economic value and can be converted to cash.",
    category: "finance",
  },
  {
    term: "Liability",
    definition: "Financial obligations or debts owed by a business or individual to others.",
    category: "finance",
  },
  {
    term: "Equity",
    definition: "The ownership interest in a company after subtracting liabilities from assets.",
    category: "finance",
  },
  {
    term: "ROI (Return on Investment)",
    definition: "A measure of the profitability of an investment, calculated as (gain - cost) / cost × 100%.",
    category: "finance",
  },
  {
    term: "Liquidity",
    definition: "The ease with which an asset can be converted into cash without affecting its market price.",
    category: "finance",
  },
  {
    term: "Cash Flow",
    definition: "The net amount of cash and cash-equivalents moving in and out of a business.",
    category: "finance",
  },
  {
    term: "Compound Interest",
    definition: "Interest calculated on the initial principal and accumulated interest from previous periods.",
    category: "finance",
  },
  {
    term: "Diversification",
    definition: "A risk management strategy that mixes a wide variety of investments within a portfolio.",
    category: "finance",
  },
  {
    term: "Dividend",
    definition: "A distribution of a portion of a company's earnings to its shareholders.",
    category: "finance",
  },
  {
    term: "APR (Annual Percentage Rate)",
    definition: "The annual rate charged for borrowing or earned through an investment, expressed as a percentage.",
    category: "finance",
  },
  {
    term: "Market Cap",
    definition: "The total market value of a company's outstanding shares, calculated as share price × total shares.",
    category: "finance",
  },
  {
    term: "Yield",
    definition: "The income return on an investment, expressed as a percentage of the investment's cost or current market value.",
    category: "finance",
  },
  {
    term: "Depreciation",
    definition: "The allocation of the cost of a tangible asset over its useful life, accounting for wear and tear.",
    category: "finance",
  },
  {
    term: "Amortization",
    definition: "The process of spreading out a loan or intangible asset cost over a period of time.",
    category: "finance",
  },
  {
    term: "Capital Gains",
    definition: "The profit realized from the sale of an asset that has increased in value.",
    category: "finance",
  },
  
  // Crypto Terms
  {
    term: "Blockchain",
    definition: "A distributed ledger technology that maintains a continuously growing list of records secured using cryptography.",
    category: "crypto",
  },
  {
    term: "Bitcoin (BTC)",
    definition: "The first and largest cryptocurrency by market cap, created in 2009 as a decentralized digital currency.",
    category: "crypto",
  },
  {
    term: "Ethereum (ETH)",
    definition: "A blockchain platform with smart contract functionality, enabling decentralized applications (dApps).",
    category: "crypto",
  },
  {
    term: "Wallet",
    definition: "A digital tool used to store, send, and receive cryptocurrencies. Can be hot (online) or cold (offline).",
    category: "crypto",
  },
  {
    term: "DeFi (Decentralized Finance)",
    definition: "Financial services built on blockchain networks that operate without traditional intermediaries.",
    category: "crypto",
  },
  {
    term: "NFT (Non-Fungible Token)",
    definition: "A unique digital asset that represents ownership of a specific item, stored on a blockchain.",
    category: "crypto",
  },
  {
    term: "Mining",
    definition: "The process of validating transactions and adding them to a blockchain, typically rewarded with cryptocurrency.",
    category: "crypto",
  },
  {
    term: "Staking",
    definition: "The process of holding cryptocurrency in a wallet to support network operations and earn rewards.",
    category: "crypto",
  },
  {
    term: "HODL",
    definition: "A crypto slang term meaning 'hold on for dear life' - holding cryptocurrency long-term regardless of price volatility.",
    category: "crypto",
  },
  {
    term: "Gas Fees",
    definition: "Transaction fees paid to process transactions on blockchain networks like Ethereum.",
    category: "crypto",
  },
  {
    term: "Altcoin",
    definition: "Any cryptocurrency other than Bitcoin. Examples include Ethereum, Cardano, and Solana.",
    category: "crypto",
  },
  {
    term: "Smart Contract",
    definition: "Self-executing contracts with terms directly written into code, automatically enforcing agreement terms.",
    category: "crypto",
  },
  {
    term: "DEX (Decentralized Exchange)",
    definition: "A cryptocurrency exchange that operates without a central authority, allowing peer-to-peer trading.",
    category: "crypto",
  },
  {
    term: "Whale",
    definition: "An individual or entity that holds a large amount of cryptocurrency, capable of influencing market prices.",
    category: "crypto",
  },
  {
    term: "FOMO (Fear Of Missing Out)",
    definition: "The anxiety that one might miss out on a potentially profitable investment opportunity.",
    category: "crypto",
  },
  
  // Startup Terms
  {
    term: "MVP (Minimum Viable Product)",
    definition: "A product with just enough features to satisfy early customers and provide feedback for future development.",
    category: "startup",
  },
  {
    term: "Bootstrapping",
    definition: "Starting a business with personal savings and revenue, without external funding or investment.",
    category: "startup",
  },
  {
    term: "VC (Venture Capital)",
    definition: "Private equity financing provided by firms to startups and small businesses with high growth potential.",
    category: "startup",
  },
  {
    term: "Angel Investor",
    definition: "An affluent individual who provides capital for startups in exchange for ownership equity or convertible debt.",
    category: "startup",
  },
  {
    term: "Unicorn",
    definition: "A privately held startup company valued at over $1 billion.",
    category: "startup",
  },
  {
    term: "Burn Rate",
    definition: "The rate at which a company spends its capital to cover overhead before generating positive cash flow.",
    category: "startup",
  },
  {
    term: "Runway",
    definition: "The amount of time a company has before it runs out of money, typically calculated as cash ÷ monthly burn rate.",
    category: "startup",
  },
  {
    term: "Pivot",
    definition: "A strategic change in a startup's business model, product, or target market to improve prospects.",
    category: "startup",
  },
  {
    term: "Exit Strategy",
    definition: "A planned approach to transferring ownership of a company, typically through acquisition or IPO.",
    category: "startup",
  },
  {
    term: "Equity Split",
    definition: "The division of company ownership among founders and early team members.",
    category: "startup",
  },
  {
    term: "Product-Market Fit",
    definition: "The degree to which a product satisfies strong market demand, indicating a viable business opportunity.",
    category: "startup",
  },
  {
    term: "Series A/B/C",
    definition: "Stages of venture capital funding rounds, with each round typically for further growth and scaling.",
    category: "startup",
  },
  {
    term: "Accelerator",
    definition: "A program designed to help startups grow rapidly through mentorship, funding, and resources over a fixed period.",
    category: "startup",
  },
  {
    term: "Incubator",
    definition: "An organization that helps early-stage startups develop by providing workspace, mentorship, and resources.",
    category: "startup",
  },
  {
    term: "Valuation",
    definition: "The process of determining the current worth of a company or asset.",
    category: "startup",
  },
  
  // Business Terms
  {
    term: "Revenue",
    definition: "The total income generated from normal business operations, typically from sales of goods or services.",
    category: "business",
  },
  {
    term: "Profit Margin",
    definition: "A measure of profitability calculated as (revenue - costs) / revenue × 100%.",
    category: "business",
  },
  {
    term: "B2B (Business-to-Business)",
    definition: "Commerce transactions between businesses, rather than between a business and consumers.",
    category: "business",
  },
  {
    term: "B2C (Business-to-Consumer)",
    definition: "Commerce transactions between businesses and individual consumers.",
    category: "business",
  },
  {
    term: "KPIs (Key Performance Indicators)",
    definition: "Measurable values that demonstrate how effectively a company is achieving key business objectives.",
    category: "business",
  },
  {
    term: "SaaS (Software as a Service)",
    definition: "A software distribution model where applications are hosted by a provider and accessed over the internet.",
    category: "business",
  },
  {
    term: "Churn Rate",
    definition: "The percentage of customers or subscribers who stop using a service over a given period.",
    category: "business",
  },
  {
    term: "MRR (Monthly Recurring Revenue)",
    definition: "The predictable revenue a company expects to receive every month from subscription-based products or services.",
    category: "business",
  },
  {
    term: "CAC (Customer Acquisition Cost)",
    definition: "The cost associated with acquiring a new customer, including marketing and sales expenses.",
    category: "business",
  },
  {
    term: "LTV (Customer Lifetime Value)",
    definition: "The predicted revenue a customer will generate throughout their relationship with a company.",
    category: "business",
  },
  {
    term: "Gross Margin",
    definition: "The difference between revenue and cost of goods sold, expressed as a percentage of revenue.",
    category: "business",
  },
  {
    term: "Working Capital",
    definition: "The difference between current assets and current liabilities, indicating short-term financial health.",
    category: "business",
  },
  {
    term: "EBITDA",
    definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization - a measure of operating performance.",
    category: "business",
  },
  {
    term: "Break-even Point",
    definition: "The point at which total revenue equals total costs, resulting in neither profit nor loss.",
    category: "business",
  },
  {
    term: "ROI (Return on Investment)",
    definition: "A performance measure used to evaluate the efficiency of an investment.",
    category: "business",
  },
];

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((term) => {
      const matchesSearch =
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { value: "all", label: "All Categories", count: GLOSSARY_TERMS.length },
    { 
      value: "finance", 
      label: "Finance", 
      count: GLOSSARY_TERMS.filter(t => t.category === "finance").length 
    },
    { 
      value: "crypto", 
      label: "Crypto", 
      count: GLOSSARY_TERMS.filter(t => t.category === "crypto").length 
    },
    { 
      value: "startup", 
      label: "Startup", 
      count: GLOSSARY_TERMS.filter(t => t.category === "startup").length 
    },
    { 
      value: "business", 
      label: "Business", 
      count: GLOSSARY_TERMS.filter(t => t.category === "business").length 
    },
  ];

  const categoryColors = {
    finance: "bg-blue-500/10 text-blue-700 border-blue-200",
    crypto: "bg-purple-500/10 text-purple-700 border-purple-200",
    startup: "bg-orange-500/10 text-orange-700 border-orange-200",
    business: "bg-green-500/10 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between -mt-4 mb-2">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-muted-foreground">
              Comprehensive glossary of finance, crypto, startup, and business terms
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="border-[#C1FF72]/30">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search terms or definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.value
                ? "bg-gradient-to-r from-[#C1FF72] to-[#A8E063] text-gray-900 shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms
        </p>
      </div>

      {/* Terms Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {filteredTerms.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No terms found</p>
            <p className="text-sm text-muted-foreground">Try a different search or category</p>
          </div>
        ) : (
          filteredTerms.map((item, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all border-[#C1FF72]/20 hover:border-[#C1FF72]/50 cursor-default h-full hover:bg-gradient-to-br hover:from-[#C1FF72]/5 hover:to-transparent"
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-base leading-tight text-foreground">{item.term}</h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize w-fit ${categoryColors[item.category]}`}
                  >
                    {item.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

