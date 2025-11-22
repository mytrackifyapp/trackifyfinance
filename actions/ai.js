"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

function summarizeForModel({ accounts, transactions, budget }) {
  const recent = transactions.slice(0, 100).map((t) => ({
    type: t.type,
    amount: Number(t.amount),
    category: t.category,
    date: new Date(t.date).toISOString().slice(0, 10),
    accountId: t.accountId,
  }));
  const accountsSummary = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    isDefault: a.isDefault,
    balance: Number(a.balance),
    type: a.type,
  }));
  const budgetSummary = budget
    ? { amount: Number(budget.amount), updatedAt: budget.updatedAt?.toISOString?.() }
    : null;
  return { accounts: accountsSummary, transactions: recent, budget: budgetSummary };
}

export async function getInsights({ messages = [], currency = "USD" } = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GOOGLE_GEMINI_API_KEY");
  }
  let GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Fetch user data
  const [accounts, transactions, budget] = await Promise.all([
    db.account.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 300,
    }),
    db.budget.findUnique({ where: { userId: user.id } }),
  ]);

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const userData = summarizeForModel({ accounts, transactions, budget });

  function isGreeting(text) {
    const t = (text || "").trim().toLowerCase();
    if (!t) return true;
    const greetings = ["hi", "hello", "hey", "yo", "good morning", "good evening", "good afternoon"];
    return greetings.some((g) => t === g || t.startsWith(g));
  }

  function isInsightQuery(text) {
    const t = (text || "").toLowerCase();
    const keywords = [
      "insight",
      "spend",
      "spending",
      "expense",
      "income",
      "net",
      "budget",
      "category",
      "breakdown",
      "trend",
      "summary",
      "report",
      "account",
      "balance",
    ];
    return keywords.some((k) => t.includes(k));
  }

  function isWebQuery(text) {
    const t = (text || "").toLowerCase();
    const webWords = [
      "current",
      "today",
      "live",
      "latest",
      "price",
      "prices",
      "exchange rate",
      "fx",
      "market",
      "policy",
      "policies",
      "reviews",
      "btc",
      "bitcoin",
      "eth",
      "crypto",
      "inflation",
      "cpi",
      "interest rate",
      "rate hike",
    ];
    return webWords.some((k) => t.includes(k));
  }

  function formatAmount(value) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(value) || 0);
    } catch {
      const n = Number(value) || 0;
      return `${n.toFixed(2)} ${currency}`;
    }
  }

  function buildFallbackInsights() {
    let income = 0;
    let expense = 0;
    const byCategory = {};
    for (const t of transactions) {
      const amt = Number(t.amount) || 0;
      if (t.type === "INCOME") income += amt;
      if (t.type === "EXPENSE") {
        expense += amt;
        byCategory[t.category] = (byCategory[t.category] || 0) + amt;
      }
    }
    const net = income - expense;
    const topCats = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const totalBalances = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const usedPct =
      budget && Number(budget.amount)
        ? Math.min(100, (expense / Number(budget.amount)) * 100)
        : null;

    let out = "";
    out += `SNAPSHOT\n`;
    out += `- Income: ${formatAmount(income)}  •  Expenses: ${formatAmount(expense)}  •  Net: ${formatAmount(net)}\n`;
    out += `- Total balances across accounts: ${formatAmount(totalBalances)}\n\n`;
    if (topCats.length) {
      out += `SPENDING BY CATEGORY\n`;
      for (const [cat, amt] of topCats) {
        out += `- ${cat}: ${formatAmount(amt)}\n`;
      }
      out += `\n`;
    }
    if (budget) {
      out += `BUDGET\n`;
      out += `- Spent ${formatAmount(expense)} of ${formatAmount(budget.amount)}${
        usedPct !== null ? ` (${usedPct.toFixed(1)}% used)` : ""
      }\n\n`;
    }
    out += `NEXT STEPS\n`;
    out += `- Review top categories and set limits where needed\n`;
    out += `- Consider a target net (Income - Expenses) for this month\n`;
    out += `- If close to budget, defer large non-essentials\n`;
    return out;
  }

  function buildGeneralAnswer(question) {
    const q = (question || "").toLowerCase();
    if (!q || isGreeting(q)) {
      const suggestions = [
        "Summarize my spending by category this month",
        "Am I close to my monthly budget?",
        "What are my top 3 expenses recently?",
        "How can I improve my savings rate?",
      ];
      return [
        "Hi! How can I help with your finances today?",
        "You can ask things like:",
        ...suggestions.map((s) => `- ${s}`),
      ].join("\n");
    }
    if (isWebQuery(q)) {
      return [
        "This question needs live data (e.g., prices, rates, or market info).",
        "I can’t fetch the web right now. If you share the numbers you’re seeing, I’ll analyze them and advise next steps.",
      ].join("\n");
    }
    if (q.includes("what is finance") || (q.startsWith("what is") && q.includes("finance")) || q.includes("define finance")) {
      return [
        "Finance is the management of money — how individuals, businesses, and governments raise, allocate, and use funds.",
        "It covers:",
        "- Personal finance: budgeting, saving, debt, investing, insurance, retirement.",
        "- Corporate finance: capital structure, funding, valuation, risk.",
        "- Public finance: taxation, spending, debt, monetary/fiscal policy.",
        "In day‑to‑day life, personal finance helps you plan cash flow, build an emergency fund, reduce high‑interest debt, and invest for long‑term goals."
      ].join("\n");
    }
    if (q.includes("budget")) {
      return [
        "A simple budget framework:",
        "- Tally net monthly income (after tax).",
        "- List fixed needs (rent, utilities, minimum debt) and variable wants.",
        "- Aim 50/30/20 as a baseline: 50% needs, 30% wants, 20% saving/debt payoff.",
        "- Automate savings on payday and review categories weekly to stay on track."
      ].join("\n");
    }
    if (q.includes("invest")) {
      return [
        "Investing basics:",
        "- Build a 3–6 month emergency fund first.",
        "- Pay high‑interest debt before aggressive investing.",
        "- Use broad, low‑cost index funds; diversify across regions and asset classes.",
        "- Match risk to horizon; stay consistent with periodic contributions."
      ].join("\n");
    }
    if (q.includes("debt")) {
      return [
        "Debt payoff tips:",
        "- List debts by APR; prioritize highest‑interest (avalanche) or smallest balance (snowball).",
        "- Refinance if possible; avoid new high‑interest borrowing.",
        "- Automate extra payments and track progress monthly."
      ].join("\n");
    }
    if (q.includes("credit")) {
      return [
        "Credit score basics:",
        "- Pay on time (largest factor).",
        "- Keep utilization under ~30% (ideally <10%).",
        "- Avoid frequent hard inquiries; keep old accounts open when possible.",
        "- Check reports for errors annually."
      ].join("\n");
    }
    // Generic fallback
    return "I can help with definitions and guidance on budgeting, saving, debt, investing, and more. What would you like to know?";
  }

  // If the user just greets or doesn't ask for insights, return a conversational response
  if (!isInsightQuery(lastUser)) {
    // Let Gemini attempt a friendly reply; if it fails, we return conversational fallback
    // (we continue to call the model below; if the model returns empty we'll return the fallback)
  }

  // Prepare prompt for Gemini
  const systemInstruction = `You are Finna — an intelligent financial assistant, powered by AI. You're like Siri for finances: friendly, conversational, and helpful.
Your goals:
- Provide clear, personalized insights using the provided JSON (accounts, recent transactions, budget).
- Answer broader finance questions (budgeting, saving, debt, investing basics, emergency funds, credit utilization) with practical, actionable guidance.
- Keep answers concise, friendly, and conversational—just like talking to a friend.
- Show simple math transparently when summarizing amounts.
- If specific data is missing, say so briefly and proceed with reasonable general advice.
- Do not invent numbers that aren't in the JSON; when giving general advice, keep it generic and clearly labeled as guidance.
- Avoid legal/tax advice; if needed, suggest consulting a licensed professional.
- Be warm, approachable, and use natural language—think Siri's friendly tone.
Capabilities and Decision Logic:
1) PERSONALIZED INSIGHTS — If the question is about spending, budgeting, stablecoins, subscriptions, categories, or account activity, you MUST use the provided JSON user data.
2) GENERAL KNOWLEDGE — If the question is not about user data, answer like a general assistant with examples and reasoning.
3) WEB-ENABLED — If the question asks for current information (prices, exchange rates, market, policies), you should fetch live data. However, web access here is disabled (web_access=false). Clearly state that you cannot fetch live data and offer an alternative (e.g., analyze user-provided figures).
4) SAFETY — Do not hallucinate amounts. If unknown, say “Data unavailable” or ask for clarification.
Formatting rules:
- Do NOT use markdown headings like ###; instead, use short section titles in all caps, followed by bullets.
- Use the user's currency code (${currency}) for amounts. Format like 1,234.56 ${currency}.
- Keep the response under ~200-300 words unless the user asks for detail.
- Sections to include when applicable:
  - SNAPSHOT: 1-2 bullets (Income, Expenses, Net).
  - TOP INSIGHTS: up to 5 bullets with clear takeaways.
  - BUDGET: 1-2 bullets about progress and risk.
  - SPENDING BY CATEGORY: top 3-5 categories with amounts.
  - NEXT STEPS: up to 3 specific actions.
Context flags:
- web_access=false
`;

  function buildBody() {
    return {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `${systemInstruction}\n\n` +
                `User question:\n${lastUser || "Provide a comprehensive summary."}\n\n` +
                `User financial data (JSON):\n${JSON.stringify(userData)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
      },
    };
  }

  async function callModel(model) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
        cache: "no-store",
      }
    );
    return resp;
  }

  // Attempt primary model, fallback if not found
  let resp = await callModel(GEMINI_MODEL);
  if (!resp.ok && resp.status === 404) {
    GEMINI_MODEL = "gemini-1.5-flash";
    resp = await callModel(GEMINI_MODEL);
  }

  if (!resp.ok) {
    const err = await resp.text();
    // Provide a friendlier message and hint if model is wrong
    if (resp.status === 404 && /models\/.+ is not found/i.test(err)) {
      throw new Error(
        `Gemini request failed: Model "${GEMINI_MODEL}" not found. Try setting GOOGLE_GEMINI_MODEL=gemini-1.5-flash`
      );
    }
    throw new Error(`Gemini request failed (${resp.status}): ${err}`);
  }

  const json = await resp.json();
  // Robust extraction of text
  let reply = "";
  if (Array.isArray(json?.candidates) && json.candidates.length > 0) {
    const parts = json.candidates[0]?.content?.parts;
    if (Array.isArray(parts)) {
      reply = parts
        .map((p) => (typeof p?.text === "string" ? p.text : ""))
        .join("")
        .trim();
    }
  }
  if (!reply) {
    const safety = json?.candidates?.[0]?.safetyRatings;
    if (safety) {
      throw new Error("Gemini response was blocked by safety filters. Try rephrasing your question.");
    }
    // Fall back depending on query type
    reply = isInsightQuery(lastUser) ? buildFallbackInsights() : buildGeneralAnswer(lastUser);
  }

  return { reply };
}

