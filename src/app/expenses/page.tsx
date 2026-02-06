
"use client";

import { useFinanceStore } from "@/lib/store";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Receipt } from "lucide-react";

export default function ExpensesPage() {
  const { transactions, funds, addTransaction, totalExpense } = useFinanceStore();
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Control de Gastos</h1>
          <p className="text-muted-foreground">Categoriza y reduce tus gastos mensuales.</p>
        </div>
        <TransactionDialog type="expense" funds={funds} onAdd={addTransaction} />
      </div>

      <Card className="border-none shadow-sm bg-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-sm">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent-foreground uppercase tracking-wider">Total Gastado</p>
              <h2 className="text-4xl font-bold font-headline text-accent-foreground">
                ${totalExpense.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <h3 className="text-xl font-bold font-headline">Recibos y Facturas</h3>
        {expenseTransactions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseTransactions.map((t) => (
              <Card key={t.id} className="border-none shadow-sm hover:translate-y-[-2px] transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-tighter text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      {t.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-lg font-headline mt-2">{t.description || "Gasto sin descripción"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600">
                    -${t.amount.toLocaleString()}
                  </div>
                  {t.fundId && (
                    <p className="text-[10px] mt-2 text-muted-foreground italic font-medium">
                      Descontado del fondo asignado
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">No has registrado gastos todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
