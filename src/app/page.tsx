'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  getIncomes,
  getExpenses,
  getBudgetItems,
  getProspectiveExpenses,
  saveProspectiveExpense,
  deleteProspectiveExpense,
  getCurrentMonth,
  formatCurrency,
  formatMonth,
} from '@/lib/store';
import { Income, Expense, BudgetItem, ProspectiveExpense } from '@/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#fda085', '#f6d365', '#43e97b', '#fa709a'];

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [prospective, setProspective] = useState<ProspectiveExpense[]>([]);
  const [proDesc, setProDesc] = useState('');
  const [proAmount, setProAmount] = useState('');
  const month = getCurrentMonth();

  const refreshProspective = () =>
    setProspective(getProspectiveExpenses().filter((p) => p.month === month));

  useEffect(() => {
    setIncomes(getIncomes().filter((i) => i.month === month));
    setExpenses(getExpenses().filter((e) => e.month === month));
    setBudget(getBudgetItems().filter((b) => b.month === month));
    refreshProspective();
  }, [month]);

  function handleAddProspective(e: React.FormEvent) {
    e.preventDefault();
    if (!proDesc.trim() || !proAmount) return;
    saveProspectiveExpense({
      id: crypto.randomUUID(),
      description: proDesc.trim(),
      amount: Number(proAmount),
      month,
    });
    setProDesc('');
    setProAmount('');
    refreshProspective();
  }

  function handleDeleteProspective(id: string) {
    deleteProspectiveExpense(id);
    refreshProspective();
  }

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const totalProspective = prospective.reduce((sum, p) => sum + p.amount, 0);
  const balanceAfterProspective = balance - totalProspective;
  const totalBudget = budget.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const budgetSpent = budget.filter((b) => b.spent).reduce((sum, b) => sum + b.estimatedAmount, 0);
  const balancePercent = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;

  // Expense breakdown by category
  const expenseByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const stats = [
    {
      label: 'Ingresos del Mes',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: '#43e97b',
      bg: 'rgba(67,233,123,0.1)',
      border: 'rgba(67,233,123,0.2)',
      change: '+mes actual',
    },
    {
      label: 'Gastos Reales',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: '#fa709a',
      bg: 'rgba(250,112,154,0.1)',
      border: 'rgba(250,112,154,0.2)',
      change: `${balancePercent.toFixed(0)}% del ingreso`,
    },
    {
      label: 'Saldo Disponible',
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? '#667eea' : '#fa709a',
      bg: balance >= 0 ? 'rgba(102,126,234,0.1)' : 'rgba(250,112,154,0.1)',
      border: balance >= 0 ? 'rgba(102,126,234,0.2)' : 'rgba(250,112,154,0.2)',
      change: balance >= 0 ? 'Positivo' : 'Negativo',
    },
    {
      label: 'Presupuesto Planificado',
      value: formatCurrency(totalBudget),
      icon: Target,
      color: '#f6d365',
      bg: 'rgba(246,211,101,0.1)',
      border: 'rgba(246,211,101,0.2)',
      change: `${budget.filter(b => b.spent).length}/${budget.length} ejecutados`,
    },
  ];

  const recentTransactions = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="capitalize" style={{ color: 'rgba(232,234,246,0.5)' }}>
            {formatMonth(month)}
          </p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-white/60">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card card-hover p-5"
              style={{ border: `1px solid ${stat.border}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: stat.bg, color: stat.color }}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm mb-1" style={{ color: 'rgba(232,234,246,0.5)' }}>{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts + Transactions Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Balance Bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Resumen del Mes</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(232,234,246,0.6)' }}>Ingresos</span>
                <span className="text-sm font-medium text-emerald-400">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #43e97b, #38f9d7)' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(232,234,246,0.6)' }}>Gastos</span>
                <span className="text-sm font-medium text-pink-400">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: totalIncome > 0 ? `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` : '0%' }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #fa709a, #fee140)' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'rgba(232,234,246,0.6)' }}>Presupuesto Ejecutado</span>
                <span className="text-sm font-medium text-yellow-400">{formatCurrency(budgetSpent)}</span>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: totalBudget > 0 ? `${Math.min((budgetSpent / totalBudget) * 100, 100)}%` : '0%' }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #f6d365, #fda085)' }}
                />
              </div>
            </div>
          </div>

          {/* Saldo final */}
          <div className="mt-6 pt-5 border-t border-white/8">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'rgba(232,234,246,0.6)' }}>Saldo Neto</span>
              <span className={`text-2xl font-bold flex items-center gap-1 ${balance >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                {balance >= 0
                  ? <ArrowUpRight className="w-5 h-5" />
                  : <ArrowDownRight className="w-5 h-5" />}
                {formatCurrency(Math.abs(balance))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h2>
          {pieData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8eaf6' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p style={{ color: 'rgba(232,234,246,0.3)' }} className="text-sm">Sin gastos este mes aún</p>
            </div>
          )}
          <div className="space-y-2 mt-2">
            {pieData.slice(0, 4).map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs" style={{ color: 'rgba(232,234,246,0.6)' }}>{item.name}</span>
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
        style={{ border: '1px solid rgba(253,160,133,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(253,160,133,0.2), rgba(246,211,101,0.2))' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#fda085' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white leading-none">Gastos Probables</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,246,0.4)' }}>
              Simula gastos futuros y ve cuánto te quedaría
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Formulario */}
          <div>
            <form onSubmit={handleAddProspective} className="space-y-3">
              <input
                type="text"
                placeholder="Ej: Renta, Seguro, Viaje..."
                value={proDesc}
                onChange={(e) => setProDesc(e.target.value)}
                className="w-full"
              />
              <input
                type="number"
                placeholder="Monto estimado"
                value={proAmount}
                onChange={(e) => setProAmount(e.target.value)}
                min="0"
                className="w-full"
              />
              <button
                type="submit"
                className="btn-glow w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #fda085 0%, #f6d365 100%)' }}
              >
                <Plus className="w-4 h-4" />
                Agregar gasto probable
              </button>
            </form>

            {/* Lista */}
            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {prospective.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'rgba(232,234,246,0.3)' }}>
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
                        <p className="text-xs" style={{ color: 'rgba(253,160,133,0.7)' }}>
                          {formatCurrency(p.amount)}
                        </p>
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

          {/* Resumen proyectado */}
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(232,234,246,0.5)' }}>Saldo actual disponible</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(253,160,133,0.07)', border: '1px solid rgba(253,160,133,0.15)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(232,234,246,0.5)' }}>Total gastos probables</p>
              <p className="text-2xl font-bold" style={{ color: '#fda085' }}>
                - {formatCurrency(totalProspective)}
              </p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                background: balanceAfterProspective >= 0
                  ? 'rgba(67,233,123,0.08)'
                  : 'rgba(250,112,154,0.08)',
                border: balanceAfterProspective >= 0
                  ? '1px solid rgba(67,233,123,0.2)'
                  : '1px solid rgba(250,112,154,0.2)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: 'rgba(232,234,246,0.5)' }}>Te quedaría</p>
              <p className={`text-3xl font-bold flex items-center gap-1 ${balanceAfterProspective >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                {balanceAfterProspective >= 0
                  ? <ArrowUpRight className="w-6 h-6" />
                  : <ArrowDownRight className="w-6 h-6" />}
                {formatCurrency(Math.abs(balanceAfterProspective))}
              </p>
              {balanceAfterProspective < 0 && (
                <p className="text-xs mt-1 text-pink-400">Cuidado: tus gastos probables superan tu saldo</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Movimientos Recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'rgba(232,234,246,0.3)' }}>
            Sin movimientos este mes. ¡Comienza registrando un ingreso!
          </p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: tx.type === 'income' ? 'rgba(67,233,123,0.15)' : 'rgba(250,112,154,0.15)',
                    }}
                  >
                    {tx.type === 'income'
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-pink-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description}</p>
                    <p className="text-xs" style={{ color: 'rgba(232,234,246,0.4)' }}>
                      {tx.category} • {new Date(tx.date).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
