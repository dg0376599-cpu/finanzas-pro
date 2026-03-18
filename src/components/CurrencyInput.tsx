'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface Props {
  valueUSD: number;
  onChange: (usd: number) => void;
  placeholder?: string;
  required?: boolean;
}

export default function CurrencyInput({ valueUSD, onChange, placeholder, required }: Props) {
  const { rate, usdToBs, bsToUsd } = useCurrency();
  const [mode, setMode] = useState<'USD' | 'Bs'>('USD');
  const [input, setInput] = useState(valueUSD > 0 ? String(valueUSD) : '');

  useEffect(() => {
    if (valueUSD === 0) setInput('');
  }, [valueUSD]);

  const toggleMode = () => {
    if (!rate) return;
    const num = parseFloat(input) || 0;
    const next = mode === 'USD' ? 'Bs' : 'USD';
    setInput(next === 'Bs' ? usdToBs(num).toFixed(2) : bsToUsd(num).toFixed(2));
    setMode(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const num = parseFloat(e.target.value) || 0;
    onChange(mode === 'USD' ? num : bsToUsd(num));
  };

  const preview = () => {
    if (!rate || !input) return null;
    const num = parseFloat(input) || 0;
    if (num === 0) return null;
    return mode === 'USD'
      ? `≈ Bs. ${usdToBs(num).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `≈ $${bsToUsd(num).toFixed(2)} USD`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggleMode}
          disabled={!rate}
          className="flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 min-w-[64px]"
          style={
            mode === 'USD'
              ? { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', boxShadow: '0 2px 12px rgba(102,126,234,0.4)' }
              : { background: 'linear-gradient(135deg, rgba(246,211,101,0.25), rgba(253,160,133,0.25))', color: '#f6d365', border: '1px solid rgba(246,211,101,0.4)' }
          }
        >
          {mode === 'USD' ? '$ USD' : 'Bs.'}
        </button>
        <input
          type="number"
          className="flex-1"
          placeholder={placeholder || '0.00'}
          value={input}
          onChange={handleChange}
          min="0"
          step="any"
          required={required}
        />
      </div>
      {preview() && (
        <p className="text-xs pl-1 transition-all" style={{ color: 'rgba(246,211,101,0.6)' }}>
          {preview()}
        </p>
      )}
    </div>
  );
}
