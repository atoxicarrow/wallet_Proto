
"use client";

import { useFinanceStore } from "@/lib/store";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

export default function IncomePage() {
  const { transactions, funds, addTransaction, totalIncome } = useFinanceStore();
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Ingresos</h1>
          <p className="text-muted-foreground">Registra y visualiza todas tus entradas de dinero.</p>
        </div>
        <TransactionDialog type="income" funds={funds} onAdd={addTransaction} />
      </div>

      <Card className="border-none shadow-sm bg-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-foreground uppercase tracking-wider">Total Ingresado</p>
              <h2 className="text-4xl font-bold font-headline text-primary-foreground">
                ${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <h3 className="text-xl font-bold font-headline">Histórico de Ingresos</h3>
        {incomeTransactions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeTransactions.map((t) => (
              <Card key={t.id} className="border-none shadow-sm hover:translate-y-[-2px] transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {t.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-lg font-headline mt-2">{t.description || "Ingreso sin descripción"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    +${t.amount.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No has registrado ingresos todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
