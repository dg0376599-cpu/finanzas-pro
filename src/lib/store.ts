'use client';

import { Income, Expense, BudgetItem, ProspectiveExpense } from '@/types';

const KEYS = {
  incomes: 'finanzas_incomes',
  expenses: 'finanzas_expenses',
  budget: 'finanzas_budget',
  prospective: 'finanzas_prospective',
};

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// --- INCOMES ---
export function getIncomes(): Income[] { return getItem<Income>(KEYS.incomes); }
export function saveIncome(income: Income) { setItem(KEYS.incomes, [...getIncomes(), income]); }
export function deleteIncome(id: string) { setItem(KEYS.incomes, getIncomes().filter((i) => i.id !== id)); }

// --- EXPENSES ---
export function getExpenses(): Expense[] { return getItem<Expense>(KEYS.expenses); }
export function saveExpense(expense: Expense) { setItem(KEYS.expenses, [...getExpenses(), expense]); }
export function deleteExpense(id: string) { setItem(KEYS.expenses, getExpenses().filter((e) => e.id !== id)); }

// --- BUDGET ---
export function getBudgetItems(): BudgetItem[] { return getItem<BudgetItem>(KEYS.budget); }
export function saveBudgetItem(item: BudgetItem) { setItem(KEYS.budget, [...getBudgetItems(), item]); }
export function updateBudgetItem(id: string, updates: Partial<BudgetItem>) {
  setItem(KEYS.budget, getBudgetItems().map((b) => (b.id === id ? { ...b, ...updates } : b)));
}
export function deleteBudgetItem(id: string) { setItem(KEYS.budget, getBudgetItems().filter((b) => b.id !== id)); }

// --- PROSPECTIVE EXPENSES ---
export function getProspectiveExpenses(): ProspectiveExpense[] { return getItem<ProspectiveExpense>(KEYS.prospective); }
export function saveProspectiveExpense(item: ProspectiveExpense) { setItem(KEYS.prospective, [...getProspectiveExpenses(), item]); }
export function deleteProspectiveExpense(id: string) { setItem(KEYS.prospective, getProspectiveExpenses().filter((p) => p.id !== id)); }

// --- UTILS ---
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Amounts are stored in USD
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
}
