'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ArrowUpRight, ArrowDownRight, Clock, AlertCircle, Plus, Trash2,
} from 'lucide-react';
import {
  getIncomes, getExpenses, getBudgetItems, getProspectiveExpenses,
  saveProspectiveExpense, deleteProspectiveExpense, getCurrentMonth, formatCurrency, formatMonth,
} from '@/lib/store';
import { Income, Expense, BudgetItem, ProspectiveExpense } from '@/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';
import { playSuccess, playDelete } from '@/lib/sounds';
import CurrencyInput from '@/components/CurrencyInput';

const COLORS = ['#667eea', '#764ba2', '#fda085', '#f6d365', '#43e97b', '#fa709a', '#4facfe'];

function DualAmount({ usd, className = '' }: { usd: number; className?: string }) {
  const { fmtBs, usdToBs, rate } = useCurrency();
  return (
    <span className={className}>
      {formatCurrency(usd)}
      {rate && (
        <span className="block text-xs font-normal mt-0.5" style={{ color: 'rgba(246,211,101,0.65)' }}>
          {fmtBs(usdToBs(usd))}
        </span>
      )}
    </span>
  );
}

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [prospective, setProspective] = useState<ProspectiveExpense[]>([]);
  const [proDesc, setProDesc] = useState('');
  const [proAmountUSD, setProAmountUSD] = useState(0);
  const month = getCurrentMonth();
  const { fmtUSD, fmtBs, usdToBs, rate } = useCurrency();

  const refresh = () => {
    setIncomes(getIncomes().filter((i) => i.month === month));
    setExpenses(getExpenses().filter((e) => e.month === month));
    setBudget(getBudgetItems().filter((b) => b.month === month));
    setProspective(getProspectiveExpenses().filter((p) => p.month === month));
  };

  useEffect(() => { refresh(); }, [month]);

  function handleAddProspective(e: React.FormEvent) {
    e.preventDefault();
    if (!proDesc.trim() || !proAmountUSD) return;
    saveProspectiveExpense({ id: crypto.randomUUID(), description: proDesc.trim(), amount: proAmountUSD, month });
    setProDesc('');
    setProAmountUSD(0);
    refresh();
    playSuccess();
  }

  function handleDeleteProspective(id: string) {
    deleteProspectiveExpense(id);
    refresh();
    playDelete();
  }

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const totalProspective = prospective.reduce((s, p) => s + p.amount, 0);
  const balanceAfterProspective = balance - totalProspective;
  const totalBudget = budget.reduce((s, b) => s + b.estimatedAmount, 0);
  const budgetSpent = budget.filter((b) => b.spent).reduce((s, b) => s + b.estimatedAmount, 0);
  const balancePercent = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;

  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Ingresos del Mes', value: totalIncome, icon: TrendingUp, color: '#43e97b', bg: 'rgba(67,233,123,0.08)', border: 'rgba(67,233,123,0.2)', change: '+mes actual' },
    { label: 'Gastos Reales', value: totalExpenses, icon: TrendingDown, color: '#fa709a', bg: 'rgba(250,112,154,0.08)', border: 'rgba(250,112,154,0.2)', change: `${balancePercent.toFixed(0)}% del ingreso` },
    { label: 'Saldo Disponible', value: balance, icon: Wallet, color: balance >= 0 ? '#667eea' : '#fa709a', bg: balance >= 0 ? 'rgba(102,126,234,0.08)' : 'rgba(250,112,154,0.08)', border: balance >= 0 ? 'rgba(102,126,234,0.2)' : 'rgba(250,112,154,0.2)', change: balance >= 0 ? 'Positivo' : 'Negativo' },
    { label: 'Presupuesto', value: totalBudget, icon: Target, color: '#f6d365', bg: 'rgba(246,211,101,0.08)', border: 'rgba(246,211,101,0.2)', change: `${budget.filter(b => b.spent).length}/${budget.length} ejecutados` },
  ];

  const recentTransactions = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="capitalize" style={{ color: 'rgba(232,234,246,0.45)' }}>{formatMonth(month)}</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-sm" style={{ color: 'rgba(232,234,246,0.5)' }}>
            {new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card card-hover p-5"
              style={{ border: `1px solid ${stat.border}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: stat.bg, color: stat.color }}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: 'rgba(232,234,246,0.45)' }}>{stat.label}</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stat.value)}</p>
              {rate && (
                <p className="text-xs mt-1" style={{ color: 'rgba(246,211,101,0.55)' }}>
                  {fmtBs(usdToBs(stat.value))}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Balance Bar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Resumen del Mes</h2>
          <div className="space-y-5">
            {[
              { label: 'Ingresos', val: totalIncome, max: totalIncome, color: '#43e97b', color2: '#38f9d7', textColor: 'text-emerald-400', delay: 0.5 },
              { label: 'Gastos', val: totalExpenses, max: totalIncome, color: '#fa709a', color2: '#fee140', textColor: 'text-pink-400', delay: 0.6 },
              { label: 'Presupuesto Ejecutado', val: budgetSpent, max: totalBudget, color: '#f6d365', color2: '#fda085', textColor: 'text-yellow-400', delay: 0.7 },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm" style={{ color: 'rgba(232,234,246,0.55)' }}>{bar.label}</span>
                  <span className={`text-sm font-semibold ${bar.textColor}`}>{formatCurrency(bar.val)}</span>
                </div>
                <div className="w-full h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: bar.max > 0 ? `${Math.min((bar.val / bar.max) * 100, 100)}%` : '0%' }}
                    transition={{ delay: bar.delay, duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${bar.color}, ${bar.color2})` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="neon-divider my-5" />
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'rgba(232,234,246,0.55)' }}>Saldo Neto</span>
            <div className="text-right">
              <span className={`text-2xl font-bold flex items-center gap-1 ${balance >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                {balance >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                {formatCurrency(Math.abs(balance))}
              </span>
              {rate && <p className="text-xs" style={{ color: 'rgba(246,211,101,0.55)' }}>{fmtBs(usdToBs(Math.abs(balance)))}</p>}
            </div>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h2>
          {pieData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e8eaf6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p style={{ color: 'rgba(232,234,246,0.25)' }} className="text-sm">Sin gastos este mes aún</p>
            </div>
          )}
          <div className="space-y-2 mt-3">
            {pieData.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs" style={{ color: 'rgba(232,234,246,0.55)' }}>{item.name}</span>
                </div>
                <span className="text-xs font-medium text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gastos Probables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="glass-card p-6"
        style={{ border: '1px solid rgba(253,160,133,0.18)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(253,160,133,0.2), rgba(246,211,101,0.2))' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#fda085' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white leading-none">Gastos Probables</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,246,0.4)' }}>Simula gastos futuros y ve cuánto te quedaría</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Form */}
          <div>
            <form onSubmit={handleAddProspective} className="space-y-3">
              <input
                type="text"
                placeholder="Ej: Renta, Seguro, Viaje..."
                value={proDesc}
                onChange={(e) => setProDesc(e.target.value)}
                className="w-full"
                required
              />
              <CurrencyInput valueUSD={proAmountUSD} onChange={setProAmountUSD} placeholder="Monto estimado" required />
              <button
                type="submit"
                className="btn-glow w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #fda085 0%, #f6d365 100%)' }}
              >
                <Plus className="w-4 h-4" />
                Agregar gasto probable
              </button>
            </form>

            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {prospective.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'rgba(232,234,246,0.25)' }}>
                    Aún no hay gastos probables
                  </p>
                ) : (
                  prospective.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(253,160,133,0.06)', border: '1px solid rgba(253,160,133,0.12)' }}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{p.description}</p>
                        <p className="text-xs" style={{ color: 'rgba(253,160,133,0.7)' }}>{formatCurrency(p.amount)}</p>
                        {rate && <p className="text-xs" style={{ color: 'rgba(246,211,101,0.5)' }}>{fmtBs(usdToBs(p.amount))}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteProspective(p.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'rgba(250,112,154,0.7)' }} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Projection */}
          <div className="flex flex-col gap-3">
            {[
              { label: 'Saldo actual disponible', val: balance, color: balance >= 0 ? 'text-emerald-400' : 'text-pink-400', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' },
              { label: 'Total gastos probables', val: -totalProspective, color: 'text-orange-400', bg: 'rgba(253,160,133,0.06)', border: 'rgba(253,160,133,0.14)', prefix: '- ' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(232,234,246,0.45)' }}>{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.prefix}{formatCurrency(Math.abs(item.val))}</p>
                {rate && <p className="text-xs mt-0.5" style={{ color: 'rgba(246,211,101,0.5)' }}>{item.prefix}{fmtBs(usdToBs(Math.abs(item.val)))}</p>}
              </div>
            ))}

            <div className="p-4 rounded-xl"
              style={{
                background: balanceAfterProspective >= 0 ? 'rgba(67,233,123,0.07)' : 'rgba(250,112,154,0.07)',
                border: `1px solid ${balanceAfterProspective >= 0 ? 'rgba(67,233,123,0.2)' : 'rgba(250,112,154,0.2)'}`,
              }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(232,234,246,0.45)' }}>Te quedaría</p>
              <p className={`text-3xl font-bold flex items-center gap-1 ${balanceAfterProspective >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                {balanceAfterProspective >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                {formatCurrency(Math.abs(balanceAfterProspective))}
              </p>
              {rate && <p className="text-xs mt-0.5" style={{ color: 'rgba(246,211,101,0.55)' }}>{fmtBs(usdToBs(Math.abs(balanceAfterProspective)))}</p>}
              {balanceAfterProspective < 0 && (
                <p className="text-xs mt-2 text-pink-400">Cuidado: tus gastos probables superan tu saldo</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Movimientos Recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'rgba(232,234,246,0.25)' }}>
            Sin movimientos este mes. ¡Comienza registrando un ingreso!
          </p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: tx.type === 'income' ? 'rgba(67,233,123,0.12)' : 'rgba(250,112,154,0.12)' }}>
                    {tx.type === 'income'
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-pink-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description}</p>
                    <p className="text-xs" style={{ color: 'rgba(232,234,246,0.38)' }}>
                      {tx.category} · {new Date(tx.date).toLocaleDateString('es-VE')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-pink-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  {rate && (
                    <p className="text-xs" style={{ color: 'rgba(246,211,101,0.5)' }}>
                      {fmtBs(usdToBs(tx.amount))}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
