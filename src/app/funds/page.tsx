
"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Target, PiggyBank, ArrowRight, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TransactionDialog } from "@/components/transaction-dialog";

export default function FundsPage() {
  const { funds, addFund, addTransaction } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFund({
      name,
      targetAmount: parseFloat(amount),
    });
    setName("");
    setAmount("");
    setIsAdding(false);
  };

  const formatCLP = (val: number) => val.toLocaleString('es-CL', { minimumFractionDigits: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Metas de Ahorro</h1>
          <p className="text-muted-foreground">Define tus objetivos y destina dinero para cumplirlos.</p>
        </div>
        <div className="flex gap-2">
          <TransactionDialog type="saving" funds={funds} onAdd={addTransaction} />
          <Button 
            onClick={() => setIsAdding(!isAdding)}
            variant="outline"
            className="border-accent text-accent-foreground hover:bg-accent/10 rounded-xl h-12 px-6"
          >
            {isAdding ? "Cancelar" : (
              <span className="flex items-center gap-2 font-bold">
                <Plus className="h-5 w-5" /> Nueva Meta
              </span>
            )}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Configurar Nueva Meta</CardTitle>
            <CardDescription>¿Para qué estás ahorrando hoy?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3 md:items-end">
              <div className="space-y-2">
                <Label htmlFor="fundName">Nombre de la Meta</Label>
                <Input 
                  id="fundName" 
                  placeholder="Ej: Pie para el auto" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fundAmount">Monto Objetivo ($)</Label>
                <Input 
                  id="fundAmount" 
                  type="number" 
                  placeholder="Ej: 2000000" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="bg-primary text-primary-foreground h-11 font-bold">
                Crear Objetivo
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {funds.map((fund) => {
          const percentage = (fund.currentAmount / fund.targetAmount) * 100;
          const remaining = Math.max(0, fund.targetAmount - fund.currentAmount);
          
          return (
            <Card key={fund.id} className="border-none shadow-sm group hover:shadow-md transition-all overflow-hidden">
              <div className={`h-1 w-full ${percentage >= 100 ? 'bg-emerald-500' : 'bg-accent'}`} />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary-foreground">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-xl">{fund.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Progreso hacia el objetivo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${percentage >= 100 ? 'text-emerald-600' : 'text-foreground'}`}>
                      {Math.round(percentage)}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Progress value={percentage} className="h-3 bg-secondary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ya ahorrado</p>
                    <p className="text-xl font-bold text-emerald-600">${formatCLP(fund.currentAmount)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Faltan por ahorrar</p>
                    <p className="text-xl font-bold text-rose-500">${formatCLP(remaining)}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-center text-muted-foreground italic">
                    Meta total: <span className="font-bold text-foreground">${formatCLP(fund.targetAmount)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {funds.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold font-headline mb-2">Aún no tienes metas de ahorro</h3>
            <p className="text-muted-foreground mb-6">Comienza definiendo un objetivo y destina dinero para cumplirlo.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline" className="gap-2 border-accent text-accent font-bold">
              Crear mi primera meta <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
