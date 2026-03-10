'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  getExpenses,
  saveExpense,
  deleteExpense,
  getCurrentMonth,
  formatCurrency,
  formatMonth,
} from '@/lib/store';
import { Expense } from '@/types';

const EXPENSE_CATEGORIES = [
  'Vivienda', 'Alimentación', 'Transporte', 'Entretenimiento',
  'Salud', 'Educación', 'Ropa', 'Servicios', 'Otro gasto',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Vivienda': '#667eea',
  'Alimentación': '#43e97b',
  'Transporte': '#fda085',
  'Entretenimiento': '#fa709a',
  'Salud': '#38f9d7',
  'Educación': '#f6d365',
  'Ropa': '#764ba2',
  'Servicios': '#4facfe',
  'Otro gasto': '#a8edea',
};

export default function GastosPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [filterCat, setFilterCat] = useState('Todos');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentación',
    date: new Date().toISOString().split('T')[0],
  });

  const load = () => {
    const all = getExpenses();
    setExpenses(all.filter((e) => e.month === selectedMonth));
  };

  useEffect(() => { load(); }, [selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    const expense: Expense = {
      id: uuidv4(),
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
      month: selectedMonth,
    };
    saveExpense(expense);
    setForm({ description: '', amount: '', category: 'Alimentación', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    load();
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    load();
  };

  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const filtered = filterCat === 'Todos' ? expenses : expenses.filter(e => e.category === filterCat);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Gastos</h1>
          <p style={{ color: 'rgba(232,234,246,0.5)' }} className="capitalize">{formatMonth(selectedMonth)}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Gasto
        </motion.button>
      </motion.div>

      {/* Month Filter */}
      <div className="flex gap-2 flex-wrap">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedMonth === m ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            style={selectedMonth === m ? { background: 'linear-gradient(135deg, rgba(250,112,154,0.3), rgba(254,225,64,0.2))', border: '1px solid rgba(250,112,154,0.4)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {formatMonth(m)}
          </button>
        ))}
      </div>

      {/* Total Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 flex items-center justify-between"
        style={{ border: '1px solid rgba(250,112,154,0.2)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(250,112,154,0.15)' }}>
            <TrendingDown className="w-7 h-7 text-pink-400" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'rgba(232,234,246,0.5)' }}>Total Gastado</p>
            <p className="text-3xl font-bold text-pink-400">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'rgba(232,234,246,0.4)' }}>{expenses.length} registros</p>
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card overflow-hidden"
            style={{ border: '1px solid rgba(250,112,154,0.3)' }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Registrar Gasto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Descripción</label>
                  <input
                    className="w-full"
                    placeholder="Ej: Mercado, Netflix, Gasolina..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Monto (COP)</label>
                  <input
                    type="number"
                    className="w-full"
                    placeholder="0"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Fecha</label>
                  <input
                    type="date"
                    className="w-full"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-glow flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
                >
                  Guardar Gasto
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

      {/* Category Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {['Todos', ...EXPENSE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === cat ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            style={filterCat === cat
              ? { background: CATEGORY_COLORS[cat] ? `${CATEGORY_COLORS[cat]}33` : 'rgba(102,126,234,0.2)', border: `1px solid ${CATEGORY_COLORS[cat] || '#667eea'}55` }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            {cat} {cat !== 'Todos' && expenses.filter(e => e.category === cat).length > 0 && `(${expenses.filter(e => e.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/8 flex justify-between items-center">
          <h2 className="font-semibold text-white">
            {filterCat === 'Todos' ? 'Todos los Gastos' : filterCat}
          </h2>
          {filterCat !== 'Todos' && (
            <span className="text-sm text-pink-400 font-semibold">{formatCurrency(filteredTotal)}</span>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p style={{ color: 'rgba(232,234,246,0.3)' }}>No hay gastos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {filtered.map((expense, i) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-5 hover:bg-white/2 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-10 rounded-full"
                      style={{ background: CATEGORY_COLORS[expense.category] || '#667eea' }}
                    />
                    <div>
                      <p className="font-medium text-white">{expense.description}</p>
                      <p className="text-xs" style={{ color: 'rgba(232,234,246,0.4)' }}>
                        {expense.category} • {new Date(expense.date).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-pink-400 text-lg">-{formatCurrency(expense.amount)}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(expense.id)}
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
        )}
      </div>
    </div>
  );
}
