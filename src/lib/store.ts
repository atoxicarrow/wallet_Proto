
"use client";

import { useState, useEffect } from "react";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  fundId?: string;
}

export interface Fund {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
}

const INITIAL_FUNDS: Fund[] = [
  { id: "1", name: "Fondo de Emergencia", allocatedAmount: 500000, spentAmount: 0 },
  { id: "2", name: "Vacaciones", allocatedAmount: 1000000, spentAmount: 0 },
  { id: "3", name: "Ahorro Inversión", allocatedAmount: 2000000, spentAmount: 0 },
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

    if (t.type === "expense" && t.fundId) {
      const updatedFunds = funds.map((f) =>
        f.id === t.fundId ? { ...f, spentAmount: f.spentAmount + t.amount } : f
      );
      setFunds(updatedFunds);
      localStorage.setItem("bc_funds", JSON.stringify(updatedFunds));
    }

    if (!isOffline) syncData();
  };

  const addFund = (f: Omit<Fund, "id" | "spentAmount">) => {
    const newFund = { ...f, id: Math.random().toString(36).substr(2, 9), spentAmount: 0 };
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

  const balance = totalIncome - totalExpense;

  return {
    transactions,
    funds,
    addTransaction,
    addFund,
    totalIncome,
    totalExpense,
    balance,
    isSyncing,
    isOffline,
  };
}
