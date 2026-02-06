
"use client";

import { useFinanceStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionDialog } from "@/components/transaction-dialog";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Wallet, TrendingUp, TrendingDown, CloudOff, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const {
    transactions,
    funds,
    addTransaction,
    totalIncome,
    totalExpense,
    balance,
    isOffline,
    isSyncing,
  } = useFinanceStore();

  const formatCLP = (val: number) => val.toLocaleString('es-CL', { minimumFractionDigits: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
            Resumen Financiero
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de nuevo. Así se ven tus finanzas hoy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOffline && (
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 border-amber-200">
              <CloudOff className="h-3 w-3" /> Modo Sin Conexión
            </Badge>
          )}
          {isSyncing && (
            <Badge variant="outline" className="gap-1 px-3 py-1 text-xs font-medium animate-pulse border-primary text-primary-foreground">
              <RefreshCcw className="h-3 w-3 animate-spin" /> Sincronizando...
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-secondary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Saldo Total
            </CardTitle>
            <Wallet className="h-5 w-5 text-primary-foreground opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">
              ${formatCLP(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Disponible en tus cuentas
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Ingresos Totales
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline text-emerald-600">
              +${formatCLP(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Acumulado este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Gastos Totales
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline text-rose-600">
              -${formatCLP(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Salidas de capital este mes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <TransactionDialog type="income" funds={funds} onAdd={addTransaction} />
        <TransactionDialog type="expense" funds={funds} onAdd={addTransaction} />
      </div>

      <DashboardCharts transactions={transactions} />

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
          Metas de Ahorro
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund) => {
            const percentage = (fund.spentAmount / fund.allocatedAmount) * 100;
            const remaining = fund.allocatedAmount - fund.spentAmount;
            return (
              <Card key={fund.id} className="border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold font-headline">{fund.name}</CardTitle>
                    <span className="text-sm font-bold text-accent-foreground">${formatCLP(remaining)} rest.</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-rose-500' : 'bg-accent'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Ahorrado: ${formatCLP(fund.spentAmount)}</span>
                    <span>Meta: ${formatCLP(fund.allocatedAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
