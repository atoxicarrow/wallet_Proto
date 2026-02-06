
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
            Billetera Clara
          </h1>
          <p className="text-muted-foreground mt-1">
            Resumen de tu salud financiera hoy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isOffline && (
            <Badge variant="secondary" className="gap-1 px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 border-amber-200">
              <CloudOff className="h-3 w-3" /> Modo Local
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
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Saldo Disponible
            </CardTitle>
            <Wallet className="h-5 w-5 text-primary-foreground opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">
              ${formatCLP(balance)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">
              Dinero en mano/cuenta
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Ingresos
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-emerald-600">
              +${formatCLP(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Gastos
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-rose-600">
              -${formatCLP(totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TransactionDialog type="income" funds={funds} onAdd={addTransaction} />
        <TransactionDialog type="expense" funds={funds} onAdd={addTransaction} />
        <TransactionDialog type="saving" funds={funds} onAdd={addTransaction} />
      </div>

      <DashboardCharts transactions={transactions} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline">Estado de mis Metas</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund) => {
            const percentage = (fund.currentAmount / fund.targetAmount) * 100;
            const remaining = Math.max(0, fund.targetAmount - fund.currentAmount);
            return (
              <Card key={fund.id} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold font-headline">{fund.name}</CardTitle>
                    <span className="text-xs font-bold text-emerald-600">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden mb-3">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${percentage >= 100 ? 'bg-emerald-500' : 'bg-accent'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Ahorrado</p>
                      <p className="text-sm font-bold">${formatCLP(fund.currentAmount)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Faltan</p>
                      <p className="text-sm font-bold text-rose-500">${formatCLP(remaining)}</p>
                    </div>
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
