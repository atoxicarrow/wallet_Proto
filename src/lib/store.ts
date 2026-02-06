
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// Store interno con Zustand y persistencia
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
        const id = Math.random().toString(36).substring(2, 11);
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
                  currentAmount: Math.max(0, f.currentAmount - t.amount),
                  subBudgets: updatedSubBudgets
                };
              }
              return f;
            });
          }
          
          return { transactions: updatedTransactions, funds: updatedFunds };
        });

        // Efecto visual de sincronización
        if (!get().isOffline) {
          get().setSyncing(true);
          setTimeout(() => get().setSyncing(false), 1000);
        }
      },
      addFund: (f) => {
        const id = Math.random().toString(36).substring(2, 11);
        const newFund = { ...f, id, currentAmount: 0 };
        set((state) => ({ funds: [...state.funds, newFund] }));
        
        if (!get().isOffline) {
          get().setSyncing(true);
          setTimeout(() => get().setSyncing(false), 1000);
        }
      },
    }),
    {
      name: 'billetera-clara-storage',
    }
  )
);

// Wrapper hook para manejar hidratación en Next.js y valores calculados
export function useFinanceStore() {
  const store = useFinanceStoreBase();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    if (typeof navigator !== 'undefined') {
      store.setOffline(!navigator.onLine);
    }

    const handleOnline = () => {
      store.setOffline(false);
      store.setSyncing(true);
      setTimeout(() => store.setSyncing(false), 1500);
    };
    const handleOffline = () => store.setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [store]);

  // Guardar con isHydrated para evitar errores de hidratación en Next.js
  const transactions = isHydrated ? store.transactions : [];
  const funds = isHydrated ? store.funds : INITIAL_FUNDS;

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
    ...store,
    transactions,
    funds,
    totalIncome,
    totalExpense,
    totalSavings,
    balance,
  };
}
