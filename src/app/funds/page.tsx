
"use client";

import { useState } from "react";
import { useFinanceStore, SubBudget } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Target, PiggyBank, ArrowRight, Trash2, Layers, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TransactionDialog } from "@/components/transaction-dialog";

export default function FundsPage() {
  const { funds, addFund, addTransaction } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [subBudgets, setSubBudgets] = useState<{ name: string; amount: string }[]>([]);

  const handleAddSubBudget = () => {
    setSubBudgets([...subBudgets, { name: "", amount: "" }]);
  };

  const handleRemoveSubBudget = (index: number) => {
    setSubBudgets(subBudgets.filter((_, i) => i !== index));
  };

  const handleSubBudgetChange = (index: number, field: "name" | "amount", value: string) => {
    const newSubs = [...subBudgets];
    if (field === "name") newSubs[index].name = value;
    if (field === "amount") newSubs[index].amount = value;
    setSubBudgets(newSubs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subBudgetsFormatted: SubBudget[] = subBudgets.map(sb => ({
      id: Math.random().toString(36).substr(2, 9),
      name: sb.name,
      amount: parseFloat(sb.amount) || 0,
      spent: 0
    }));

    const totalTarget = subBudgetsFormatted.reduce((acc, sb) => acc + sb.amount, 0);

    addFund({
      name,
      targetAmount: totalTarget,
      subBudgets: subBudgetsFormatted,
    });
    
    setName("");
    setSubBudgets([]);
    setIsAdding(false);
  };

  const formatCLP = (val: number) => val.toLocaleString('es-CL', { minimumFractionDigits: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Metas y Subdivisiones</h1>
          <p className="text-muted-foreground">Planifica tus ahorros detalladamente por categoría.</p>
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
                <Plus className="h-5 w-5" /> Nueva Planificación
              </span>
            )}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-accent/30 bg-accent/5 animate-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="font-headline">Configurar Nueva Meta Detallada</CardTitle>
            <CardDescription>Divide tu meta en categorías específicas (ej: Alojamiento, Comida).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fundName">Nombre de la Meta Global</Label>
                <Input 
                  id="fundName" 
                  placeholder="Ej: Vacaciones 2024" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-white"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Layers className="h-4 w-4" /> Subdivisiones de Gastos</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddSubBudget} className="text-accent font-bold">
                    <Plus className="h-4 w-4 mr-1" /> Añadir Categoría
                  </Button>
                </div>
                
                {subBudgets.map((sb, index) => (
                  <div key={index} className="flex gap-3 items-end animate-in fade-in slide-in-from-left-2">
                    <div className="flex-1 space-y-1">
                      <Input 
                        placeholder="Categoría (ej: Comida)" 
                        value={sb.name}
                        onChange={(e) => handleSubBudgetChange(index, "name", e.target.value)}
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Input 
                        type="number" 
                        placeholder="Monto $" 
                        value={sb.amount}
                        onChange={(e) => handleSubBudgetChange(index, "amount", e.target.value)}
                        required
                        className="bg-white"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveSubBudget(index)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground h-12 font-bold text-lg">
                Crear Meta Planificada (${formatCLP(subBudgets.reduce((acc, sb) => acc + (parseFloat(sb.amount) || 0), 0))})
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {funds.map((fund) => {
          const percentage = (fund.currentAmount / fund.targetAmount) * 100;
          
          return (
            <Card key={fund.id} className="border-none shadow-sm group hover:shadow-md transition-all overflow-hidden bg-white">
              <div className={`h-1.5 w-full ${percentage >= 100 ? 'bg-emerald-500' : 'bg-accent'}`} />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-primary-foreground">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="font-headline text-2xl">{fund.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Meta Total: ${formatCLP(fund.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${percentage >= 100 ? 'text-emerald-600' : 'text-foreground'}`}>
                      {Math.round(percentage)}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Progress value={percentage} className="h-3 bg-secondary" />
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Ahorrado: ${formatCLP(fund.currentAmount)}</span>
                    <span>Restante: ${formatCLP(Math.max(0, fund.targetAmount - fund.currentAmount))}</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-dashed border-border">
                  <h4 className="text-xs font-black uppercase text-accent-foreground tracking-widest flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Desglose de Presupuestos
                  </h4>
                  {fund.subBudgets.map((sb) => {
                    const sbPercentage = (sb.spent / sb.amount) * 100;
                    const isOver = sb.spent > sb.amount;
                    return (
                      <div key={sb.id} className="space-y-1 bg-secondary/30 p-3 rounded-xl border border-transparent hover:border-accent/20 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold">{sb.name}</span>
                          <span className={`text-xs font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                            ${formatCLP(sb.spent)} / ${formatCLP(sb.amount)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ease-in-out ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(sbPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className={`text-[10px] italic font-medium ${isOver ? 'text-rose-500' : 'text-muted-foreground'}`}>
                            {isOver ? (
                              <span className="flex items-center gap-1 font-bold"><AlertCircle className="h-2 w-2" /> Excedido por ${formatCLP(sb.spent - sb.amount)}</span>
                            ) : (
                              `Disponible: $${formatCLP(sb.amount - sb.spent)}`
                            )}
                          </p>
                          <span className={`text-[9px] font-black ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {Math.round(sbPercentage)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {funds.length === 0 && (
          <div className="col-span-full py-20 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold font-headline mb-2">Aún no tienes planificaciones</h3>
            <p className="text-muted-foreground mb-6">Crea una meta y subdivídela para un control total.</p>
            <Button onClick={() => setIsAdding(true)} variant="outline" className="gap-2 border-accent text-accent font-bold">
              Empezar ahora <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
