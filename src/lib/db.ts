import { supabase } from './supabase';
import type { Income, Expense, BudgetItem, ProspectiveExpense } from '@/types';

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  return user!.id;
}

// ── INCOMES ──────────────────────────────────────────
export async function getIncomes(month: string): Promise<Income[]> {
  const { data } = await supabase.from('incomes').select('*').eq('month', month).order('created_at', { ascending: false });
  return (data || []) as Income[];
}

export async function saveIncome(income: Omit<Income, 'id'>): Promise<void> {
  const user_id = await getUserId();
  await supabase.from('incomes').insert({ ...income, user_id });
}

export async function deleteIncome(id: string): Promise<void> {
  await supabase.from('incomes').delete().eq('id', id);
}

// ── EXPENSES ─────────────────────────────────────────
export async function getExpenses(month: string): Promise<Expense[]> {
  const { data } = await supabase.from('expenses').select('*').eq('month', month).order('created_at', { ascending: false });
  return (data || []) as Expense[];
}

export async function saveExpense(expense: Omit<Expense, 'id'>): Promise<void> {
  const user_id = await getUserId();
  await supabase.from('expenses').insert({ ...expense, user_id });
}

export async function deleteExpense(id: string): Promise<void> {
  await supabase.from('expenses').delete().eq('id', id);
}

// ── BUDGET ITEMS ──────────────────────────────────────
export async function getBudgetItems(month: string): Promise<BudgetItem[]> {
  const { data } = await supabase.from('budget_items').select('*').eq('month', month);
  return (data || []).map(row => ({
    id: row.id,
    description: row.description,
    estimatedAmount: row.estimated_amount,
    category: row.category,
    month: row.month,
    spent: row.spent,
  }));
}

export async function saveBudgetItem(item: Omit<BudgetItem, 'id'>): Promise<void> {
  const user_id = await getUserId();
  await supabase.from('budget_items').insert({
    description: item.description,
    estimated_amount: item.estimatedAmount,
    category: item.category,
    month: item.month,
    spent: item.spent,
    user_id,
  });
}

export async function updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (updates.spent !== undefined) mapped.spent = updates.spent;
  if (updates.estimatedAmount !== undefined) mapped.estimated_amount = updates.estimatedAmount;
  await supabase.from('budget_items').update(mapped).eq('id', id);
}

export async function deleteBudgetItem(id: string): Promise<void> {
  await supabase.from('budget_items').delete().eq('id', id);
}

// ── PROSPECTIVE EXPENSES ──────────────────────────────
export async function getProspectiveExpenses(month: string): Promise<ProspectiveExpense[]> {
  const { data } = await supabase.from('prospective_expenses').select('*').eq('month', month);
  return (data || []) as ProspectiveExpense[];
}

export async function saveProspectiveExpense(item: Omit<ProspectiveExpense, 'id'>): Promise<void> {
  const user_id = await getUserId();
  await supabase.from('prospective_expenses').insert({ ...item, user_id });
}

export async function deleteProspectiveExpense(id: string): Promise<void> {
  await supabase.from('prospective_expenses').delete().eq('id', id);
}
