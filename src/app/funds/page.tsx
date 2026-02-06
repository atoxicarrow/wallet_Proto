
"use client";

import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Target, PiggyBank, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function FundsPage() {
  const { funds, addFund } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFund({
      name,
      allocatedAmount: parseFloat(amount),
    });
    setName("");
    setAmount("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Asignación de Fondos</h1>
          <p className="text-muted-foreground">Divide tu dinero en objetivos específicos y controla tus límites.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl h-11"
        >
          {isAdding ? "Cerrar Formulario" : (
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Nuevo Fondo
            </span>
          )}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Crear Nuevo Objetivo de Gasto</CardTitle>
            <CardDescription>Establece un límite para un tipo específico de gasto.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3 md:items-end">
              <div className="space-y-2">
                <Label htmlFor="fundName">Nombre del Fondo</Label>
                <Input 
                  id="fundName" 
                  placeholder="Ej: Viaje a Japón" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fundAmount">Presupuesto Asignado</Label>
                <Input 
                  id="fundAmount" 
                  type="number" 
                  placeholder="0.00" 
                  required 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="bg-primary text-primary-foreground h-11">
                Crear Fondo
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {funds.map((fund) => {
          const percentage = (fund.spentAmount / fund.allocatedAmount) * 100;
          const remaining = fund.allocatedAmount - fund.spentAmount;
          
          return (
            <Card key={fund.id} className="border-none shadow-sm group hover:shadow-md transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary-foreground">
                      <Target className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-headline text-xl">{fund.name}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      ${remaining.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Restante</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Progreso de gasto</span>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                  <Progress value={percentage} className="h-3 bg-secondary" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Gastado: </span>
                    <span className="font-bold text-rose-500">${fund.spentAmount}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-bold text-primary-foreground">${fund.allocatedAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {funds.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold font-headline mb-2">Aún no tienes fondos asignados</h3>
            <p className="text-muted-foreground mb-6">Comienza creando un fondo para ahorrar o controlar un gasto específico.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline" className="gap-2">
              Crear mi primer fondo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
