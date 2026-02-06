
"use client";

import { useState, useEffect } from "react";

export type TransactionType = "income" | "expense" | "saving";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  fundId?: string;
  subBudgetId?: string;
}

export interface SubBudget {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

export interface Fund {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  subBudgets: SubBudget[];
}

const INITIAL_FUNDS: Fund[] = [
  { 
    id: "1", 
    name: "Vacaciones Verano", 
    targetAmount: 500000, 
    currentAmount: 0,
    subBudgets: [
      { id: "s1", name: "Alojamiento", amount: 200000, spent: 0 },
      { id: "s2", name: "Comida", amount: 150000, spent: 0 },
      { id: "s3", name: "Transporte", amount: 150000, spent: 0 },
    ]
  },
];

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const savedTransactions = localStorage.getItem("bc_transactions");
    const savedFunds = localStorage.getItem("bc_funds");
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedFunds) setFunds(JSON.parse(savedFunds));

    const handleOnline = () => {
      setIsOffline(false);
      syncData();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncData = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const addTransaction = (t: Omit<Transaction, "id">) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem("bc_transactions", JSON.stringify(updatedTransactions));

    if (t.type === "saving" && t.fundId) {
      const updatedFunds = funds.map((f) =>
        f.id === t.fundId ? { ...f, currentAmount: f.currentAmount + t.amount } : f
      );
      setFunds(updatedFunds);
      localStorage.setItem("bc_funds", JSON.stringify(updatedFunds));
    }
    
    if (t.type === "expense" && t.fundId) {
      const updatedFunds = funds.map((f) => {
        if (f.id === t.fundId) {
          const updatedSubBudgets = f.subBudgets.map(sb => 
            sb.id === t.subBudgetId ? { ...sb, spent: sb.spent + t.amount } : sb
          );
          return { 
            ...f, 
            currentAmount: Math.max(0, f.currentAmount - t.amount),
            subBudgets: updatedSubBudgets
          };
        }
        return f;
      });
      setFunds(updatedFunds);
      localStorage.setItem("bc_funds", JSON.stringify(updatedFunds));
    }

    if (!isOffline) syncData();
  };

  const addFund = (f: Omit<Fund, "id" | "currentAmount">) => {
    const newFund = { ...f, id: Math.random().toString(36).substr(2, 9), currentAmount: 0 };
    const updatedFunds = [...funds, newFund];
    setFunds(updatedFunds);
    localStorage.setItem("bc_funds", JSON.stringify(updatedFunds));
    if (!isOffline) syncData();
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = transactions
    .filter((t) => t.type === "saving")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense - totalSavings;

  return {
    transactions,
    funds,
    addTransaction,
    addFund,
    totalIncome,
    totalExpense,
    totalSavings,
    balance,
    isSyncing,
    isOffline,
  };
}
