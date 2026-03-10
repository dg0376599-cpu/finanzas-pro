export interface Income {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  month: string; // "2024-03"
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  month: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  estimatedAmount: number;
  category: string;
  month: string;
  spent: boolean;
  actualAmount?: number;
}

export interface ProspectiveExpense {
  id: string;
  description: string;
  amount: number;
  month: string;
}
