'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getIncomes, saveIncome, deleteIncome } from '@/lib/db';
import { getCurrentMonth, formatCurrency, formatMonth } from '@/lib/store';
import { Income } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { playSuccess, playDelete } from '@/lib/sounds';
import CurrencyInput from '@/components/CurrencyInput';

const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Inversiones', 'Negocio', 'Otro ingreso'];

export default function IngresosPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [amountUSD, setAmountUSD] = useState(0);
  const [form, setForm] = useState({ description: '', category: 'Salario', date: new Date().toISOString().split('T')[0] });
  const { fmtBs, usdToBs, rate } = useCurrency();

  const load = async () => setIncomes(await getIncomes(selectedMonth));
  useEffect(() => { load(); }, [selectedMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !amountUSD) return;
    await saveIncome({ ...form, amount: amountUSD, month: selectedMonth });
    setForm({ description: '', category: 'Salario', date: new Date().toISOString().split('T')[0] });
    setAmountUSD(0);
    setShowForm(false);
    load();
    playSuccess();
  };

  const handleDelete = async (id: string) => { await deleteIncome(id); load(); playDelete(); };

  const total = incomes.reduce((s, i) => s + i.amount, 0);
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Ingresos</h1>
          <p style={{ color: 'rgba(232,234,246,0.45)' }} className="capitalize">{formatMonth(selectedMonth)}</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', boxShadow: '0 4px 20px rgba(67,233,123,0.3)' }}>
          <Plus className="w-4 h-4" /> Nuevo Ingreso
        </motion.button>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {months.map((m) => (
          <button key={m} onClick={() => setSelectedMonth(m)} className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={selectedMonth === m
              ? { background: 'linear-gradient(135deg, rgba(67,233,123,0.2), rgba(56,249,215,0.15))', border: '1px solid rgba(67,233,123,0.35)', color: 'white' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,234,246,0.4)' }}>
            {formatMonth(m)}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 flex items-center justify-between" style={{ border: '1px solid rgba(67,233,123,0.2)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(67,233,123,0.12)', boxShadow: '0 4px 20px rgba(67,233,123,0.15)' }}>
            <TrendingUp className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm" style={{ color: 'rgba(232,234,246,0.45)' }}>Total de Ingresos</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(total)}</p>
            {rate && <p className="text-sm mt-0.5" style={{ color: 'rgba(246,211,101,0.6)' }}>{fmtBs(usdToBs(total))}</p>}
          </div>
        </div>
        <p className="text-sm" style={{ color: 'rgba(232,234,246,0.35)' }}>{incomes.length} registros</p>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-card overflow-hidden" style={{ border: '1px solid rgba(67,233,123,0.25)' }}>
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-5">Registrar Ingreso</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Descripción</label>
                  <input className="w-full" placeholder="Ej: Salario Marzo, Pago proyecto X..."
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Monto</label>
                  <CurrencyInput valueUSD={amountUSD} onChange={setAmountUSD} placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Categoría</label>
                  <select className="w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(232,234,246,0.5)' }}>Fecha</label>
                  <input type="date" className="w-full" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="btn-glow flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  Guardar Ingreso
                </motion.button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(232,234,246,0.5)' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card overflow-hidden">
        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-semibold text-white">Registros del Mes</h2>
        </div>
        {incomes.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-15" />
            <p style={{ color: 'rgba(232,234,246,0.25)' }}>No hay ingresos este mes</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <AnimatePresence>
              {incomes.map((income, i) => (
                <motion.div key={income.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.04 }} className="flex items-center justify-between p-5 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(67,233,123,0.1)' }}>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{income.description}</p>
                      <p className="text-xs" style={{ color: 'rgba(232,234,246,0.38)' }}>
                        {income.category} · {new Date(income.date).toLocaleDateString('es-VE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-emerald-400 text-lg">+{formatCurrency(income.amount)}</p>
                      {rate && <p className="text-xs" style={{ color: 'rgba(246,211,101,0.55)' }}>{fmtBs(usdToBs(income.amount))}</p>}
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(income.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(250,112,154,0.12)' }}>
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
