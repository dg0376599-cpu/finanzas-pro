'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CalendarDays, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  getBudgetItems,
  saveBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  saveExpense,
  getCurrentMonth,
  formatCurrency,
  formatMonth,
} from '@/lib/store';
import { BudgetItem } from '@/types';

const EXPENSE_CATEGORIES = [
  'Vivienda', 'Alimentación', 'Transporte', 'Entretenimiento',
  'Salud', 'Educación', 'Ropa', 'Servicios', 'Otro gasto',
];

export default function PresupuestoPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [form, setForm] = useState({
    description: '',
    estimatedAmount: '',
    category: 'Alimentación',
  });

  const load = () => {
    const all = getBudgetItems();
    setItems(all.filter((b) => b.month === selectedMonth));
  };

  useEffect(() => { load(); }, [selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.estimatedAmount) return;
    const item: BudgetItem = {
      id: uuidv4(),
      description: form.description,
      estimatedAmount: parseFloat(form.estimatedAmount),
      category: form.category,
      month: selectedMonth,
      spent: false,
    };
    saveBudgetItem(item);
    setForm({ description: '', estimatedAmount: '', category: 'Alimentación' });
    setShowForm(false);
    load();
  };

  const handleToggleSpent = (item: BudgetItem) => {
    if (!item.spent) {
      // Mark as spent AND register as a real expense
      updateBudgetItem(item.id, { spent: true });
      const expense = {
        id: uuidv4(),
        description: item.description,
        amount: item.estimatedAmount,
        category: item.category,
        date: new Date().toISOString().split('T')[0],
        month: item.month,
      };
      saveExpense(expense);
    } else {
      updateBudgetItem(item.id, { spent: false });
    }
    load();
  };

  const handleDelete = (id: string) => {
    deleteBudgetItem(id);
    load();
  };

  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const pending = items.filter((b) => !b.spent);
  const spent = items.filter((b) => b.spent);
  const totalEstimated = items.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const totalSpent = spent.reduce((sum, b) => sum + b.estimatedAmount, 0);
  const progress = totalEstimated > 0 ? (totalSpent / totalEstimated) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Presupuesto</h1>
          <p style={{ color: 'rgba(232,234,246,0.5)' }} className="capitalize">{formatMonth(selectedMonth)}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}
        >
          <Plus className="w-4 h-4" />
          Planificar Gasto
        </motion.button>
      </motion.div>

      {/* Month Filter */}
      <div className="flex gap-2 flex-wrap">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedMonth === m ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            style={selectedMonth === m ? { background: 'linear-gradient(135deg, rgba(246,211,101,0.3), rgba(253,160,133,0.2))', border: '1px solid rgba(246,211,101,0.4)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {formatMonth(m)}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 text-center" style={{ border: '1px solid rgba(246,211,101,0.2)' }}>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalEstimated)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(232,234,246,0.5)' }}>Total Planificado</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-5 text-center" style={{ border: '1px solid rgba(250,112,154,0.2)' }}>
          <p className="text-2xl font-bold text-pink-400">{formatCurrency(totalSpent)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(232,234,246,0.5)' }}>Ya Ejecutado</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5 text-center" style={{ border: '1px solid rgba(102,126,234,0.2)' }}>
          <p className="text-2xl font-bold text-indigo-400">{formatCurrency(totalEstimated - totalSpent)}</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(232,234,246,0.5)' }}>Por Ejecutar</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-white/60">Progreso del Presupuesto</span>
            <span className="text-sm font-semibold text-yellow-400">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f6d365, #fda085)' }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: 'rgba(232,234,246,0.4)' }}>{spent.length} ejecutados</span>
            <span className="text-xs" style={{ color: 'rgba(232,234,246,0.4)' }}>{pending.length} pendientes</span>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card overflow-hidden"
            style={{ border: '1px solid rgba(246,211,101,0.3)' }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Agregar al Presupuesto</h3>
              <p className="text-xs mb-4" style={{ color: 'rgba(232,234,246,0.4)' }}>
                Estos son gastos <strong className="text-yellow-400">estimados</strong>. Cuando los ejecutes, se moverán a Gastos Reales automáticamente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Descripción</label>
                  <input
                    className="w-full"
                    placeholder="Ej: Arriendo, Mercado estimado..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Monto Estimado (COP)</label>
                  <input
                    type="number"
                    className="w-full"
                    placeholder="0"
                    min="0"
                    value={form.estimatedAmount}
                    onChange={(e) => setForm({ ...form, estimatedAmount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Categoría</label>
                  <select
                    className="w-full"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-glow flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}
                >
                  Agregar al Plan
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl text-white/50 hover:text-white/80 transition-colors text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Items */}
      {pending.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/8">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Circle className="w-4 h-4 text-yellow-400" />
              Por Ejecutar ({pending.length})
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(232,234,246,0.4)' }}>
              Haz clic en el círculo cuando hayas realizado el gasto. Se registrará automáticamente en Gastos.
            </p>
          </div>
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {pending.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-5 hover:bg-white/2 transition-colors group"
                >
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleSpent(item)}
                    className="flex-shrink-0"
                  >
                    <Circle className="w-6 h-6 text-yellow-400/50 hover:text-yellow-400 transition-colors" />
                  </motion.button>

                  <div className="flex-1">
                    <p className="font-medium text-white">{item.description}</p>
                    <p className="text-xs" style={{ color: 'rgba(232,234,246,0.4)' }}>{item.category}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-yellow-400">{formatCurrency(item.estimatedAmount)}</p>
                      <p className="text-xs" style={{ color: 'rgba(232,234,246,0.3)' }}>estimado</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(250,112,154,0.15)' }}
                    >
                      <Trash2 className="w-4 h-4 text-pink-400" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Spent Items */}
      {spent.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-white/8">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Ejecutados ({spent.length})
              <span className="ml-auto text-xs flex items-center gap-1" style={{ color: 'rgba(232,234,246,0.4)' }}>
                <ArrowRight className="w-3 h-3" /> Registrado en Gastos
              </span>
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {spent.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-5 opacity-60"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleToggleSpent(item)}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </motion.button>
                <div className="flex-1">
                  <p className="font-medium text-white line-through">{item.description}</p>
                  <p className="text-xs" style={{ color: 'rgba(232,234,246,0.4)' }}>{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">{formatCurrency(item.estimatedAmount)}</p>
                  <p className="text-xs" style={{ color: 'rgba(232,234,246,0.3)' }}>ejecutado</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p style={{ color: 'rgba(232,234,246,0.3)' }}>No hay presupuesto planificado para este mes</p>
          <p className="text-sm mt-2" style={{ color: 'rgba(232,234,246,0.2)' }}>Usa el botón "Planificar Gasto" para comenzar</p>
        </motion.div>
      )}
    </div>
  );
}
