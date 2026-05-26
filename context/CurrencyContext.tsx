"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Currency = { code: string; symbol: string; label: string };

export const CURRENCIES: Currency[] = [
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "USD", symbol: "$", label: "Dollar" },
  { code: "XOF", symbol: "FCFA", label: "Franc CFA" },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES[0],
  setCurrency: () => {},
  convert: (amount) => `${amount} €`,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return CURRENCIES[0];
    const saved = localStorage.getItem("etrack_currency");
    return CURRENCIES.find((c) => c.code === saved) ?? CURRENCIES[0];
  });

  const [rates, setRates] = useState<Record<string, number>>({ EUR: 1, USD: 1, XOF: 1 });

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/EUR")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates) {
          setRates({ EUR: 1, USD: data.rates.USD, XOF: data.rates.XOF });
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("etrack_currency", c.code);
    }
  };

  const convert = (amount: number): string => {
    const rate = rates[currency.code] ?? 1;
    const converted = amount * rate;
    const formatted =
      currency.code === "XOF"
        ? Math.round(converted).toLocaleString("fr-FR")
        : converted.toFixed(2);
    return `${formatted} ${currency.symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
