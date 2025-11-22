"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_CURRENCY,
  getStoredCurrency,
  setStoredCurrency,
  formatCurrency,
} from "@/lib/currency";

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  format: (amount) => formatCurrency(amount, DEFAULT_CURRENCY),
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrencyState(getStoredCurrency());
  }, []);

  const setCurrency = (code) => {
    setStoredCurrency(code);
    setCurrencyState(code);
  };

  const value = {
    currency,
    setCurrency,
    format: (amount) => formatCurrency(amount, currency),
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

