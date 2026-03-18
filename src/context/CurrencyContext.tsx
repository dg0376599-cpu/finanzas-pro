'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface CurrencyCtx {
  rate: number | null;
  loading: boolean;
  lastUpdated: string | null;
  usdToBs: (usd: number) => number;
  bsToUsd: (bs: number) => number;
  fmtUSD: (n: number) => string;
  fmtBs: (n: number) => string;
  refresh: () => void;
}

const Ctx = createContext<CurrencyCtx>(null!);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      const res = await fetch('/api/bcv-rate');
      const data = await res.json();
      if (data.rate) {
        setRate(data.rate);
        setLastUpdated(data.updatedAt);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchRate();
    const iv = setInterval(fetchRate, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchRate]);

  const usdToBs = (usd: number) => (rate ? usd * rate : 0);
  const bsToUsd = (bs: number) => (rate ? bs / rate : 0);

  const fmtUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  const fmtBs = (n: number) =>
    `Bs. ${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

  return (
    <Ctx.Provider value={{ rate, loading, lastUpdated, usdToBs, bsToUsd, fmtUSD, fmtBs, refresh: fetchRate }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCurrency = () => useContext(Ctx);
