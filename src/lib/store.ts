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
export function getIncomes(): Income[] {
  return getItem<Income>(KEYS.incomes);
}

export function saveIncome(income: Income) {
  const all = getIncomes();
  setItem(KEYS.incomes, [...all, income]);
}

export function deleteIncome(id: string) {
  const all = getIncomes().filter((i) => i.id !== id);
  setItem(KEYS.incomes, all);
}

// --- EXPENSES ---
export function getExpenses(): Expense[] {
  return getItem<Expense>(KEYS.expenses);
}

export function saveExpense(expense: Expense) {
  const all = getExpenses();
  setItem(KEYS.expenses, [...all, expense]);
}

export function deleteExpense(id: string) {
  const all = getExpenses().filter((e) => e.id !== id);
  setItem(KEYS.expenses, all);
}

// --- BUDGET ---
export function getBudgetItems(): BudgetItem[] {
  return getItem<BudgetItem>(KEYS.budget);
}

export function saveBudgetItem(item: BudgetItem) {
  const all = getBudgetItems();
  setItem(KEYS.budget, [...all, item]);
}

export function updateBudgetItem(id: string, updates: Partial<BudgetItem>) {
  const all = getBudgetItems().map((b) => (b.id === id ? { ...b, ...updates } : b));
  setItem(KEYS.budget, all);
}

export function deleteBudgetItem(id: string) {
  const all = getBudgetItems().filter((b) => b.id !== id);
  setItem(KEYS.budget, all);
}

// --- PROSPECTIVE EXPENSES ---
export function getProspectiveExpenses(): ProspectiveExpense[] {
  return getItem<ProspectiveExpense>(KEYS.prospective);
}

export function saveProspectiveExpense(item: ProspectiveExpense) {
  const all = getProspectiveExpenses();
  setItem(KEYS.prospective, [...all, item]);
}

export function deleteProspectiveExpense(id: string) {
  const all = getProspectiveExpenses().filter((p) => p.id !== id);
  setItem(KEYS.prospective, all);
}

// --- UTILS ---
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}
