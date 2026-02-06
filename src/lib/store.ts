
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';

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
    name: "Vacaciones Viña", 
    targetAmount: 300000, 
    currentAmount: 0,
    subBudgets: [
      { id: "s1", name: "Alojamiento", amount: 150000, spent: 0 },
      { id: "s2", name: "Comida", amount: 100000, spent: 0 },
      { id: "s3", name: "Pasajes", amount: 50000, spent: 0 },
    ]
  },
];

interface FinanceState {
  transactions: Transaction[];
  funds: Fund[];
  isSyncing: boolean;
  isOffline: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  addFund: (f: Omit<Fund, "id" | "currentAmount">) => void;
  setOffline: (offline: boolean) => void;
  setSyncing: (syncing: boolean) => void;
}

const useFinanceStoreBase = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      funds: INITIAL_FUNDS,
      isSyncing: false,
      isOffline: false,
      
      setOffline: (isOffline) => set({ isOffline }),
      setSyncing: (isSyncing) => set({ isSyncing }),

      addTransaction: (t) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 11);

        const newTransaction = { ...t, id };
        
        set((state) => {
          const updatedTransactions = [newTransaction, ...state.transactions];
          let updatedFunds = [...state.funds];

          if (t.type === "saving" && t.fundId) {
            updatedFunds = updatedFunds.map((f) =>
              f.id === t.fundId ? { ...f, currentAmount: f.currentAmount + t.amount } : f
            );
          }
          
          if (t.type === "expense" && t.fundId) {
            updatedFunds = updatedFunds.map((f) => {
              if (f.id === t.fundId) {
                const updatedSubBudgets = f.subBudgets.map(sb => 
                  sb.id === t.subBudgetId ? { ...sb, spent: sb.spent + t.amount } : sb
                );
                return { 
                  ...f, 
                  currentAmount: f.currentAmount - t.amount, 
                  subBudgets: updatedSubBudgets
                };
              }
              return f;
            });
          }
          
          return { transactions: updatedTransactions, funds: updatedFunds };
        });

        if (!get().isOffline) {
          get().setSyncing(true);
          setTimeout(() => get().setSyncing(false), 800);
        }
      },

      addFund: (f) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 11);
        const newFund = { ...f, id, currentAmount: 0 };
        set((state) => ({ funds: [...state.funds, newFund] }));
      },
    }),
    {
      name: 'billetera-clara-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useFinanceStore() {
  const store = useFinanceStoreBase();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof navigator !== 'undefined') {
      useFinanceStoreBase.setState({ isOffline: !navigator.onLine });
    }
    const handleOnline = () => useFinanceStoreBase.setState({ isOffline: false, isSyncing: true });
    const handleOffline = () => useFinanceStoreBase.setState({ isOffline: true });
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isHydrated) {
    return {
      transactions: [],
      funds: [],
      isSyncing: false,
      isOffline: false,
      addTransaction: () => {},
      addFund: () => {},
      setOffline: () => {},
      setSyncing: () => {},
      totalIncome: 0,
      totalExpense: 0,
      totalSavings: 0,
      balance: 0
    };
  }

  const totalIncome = store.transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = store.transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = store.transactions
    .filter((t) => t.type === "saving")
    .reduce((acc, t) => acc + t.amount, 0);

  const expensesFromFunds = store.transactions
    .filter((t) => t.type === "expense" && t.fundId)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - (totalExpense - expensesFromFunds) - totalSavings;

  return {
    ...store,
    totalIncome,
    totalExpense,
    totalSavings,
    balance,
  };
}
