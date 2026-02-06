
"use client";

import { useState } from "react";
import { PlusCircle, PiggyBank, ArrowDownCircle, ArrowUpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionType, Fund, useFinanceStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface TransactionDialogProps {
  type: TransactionType;
  funds: Fund[];
  onAdd: (transaction: any) => void;
}

export function TransactionDialog({ type, funds, onAdd }: TransactionDialogProps) {
  const { balance } = useFinanceStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [fundId, setFundId] = useState<string | undefined>();
  const [subBudgetId, setSubBudgetId] = useState<string | undefined>();

  const selectedFund = funds.find(f => f.id === fundId);
  const selectedSubBudget = selectedFund?.subBudgets.find(sb => sb.id === subBudgetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ variant: "destructive", title: "Monto inválido", description: "Por favor ingresa un monto mayor a 0." });
      return;
    }

    // Validaciones de Saldo Disponible (Wallet)
    if (type !== 'income' && numAmount > balance && (type === 'saving' || (type === 'expense' && (!fundId || fundId === 'none')))) {
      toast({ 
        variant: "destructive", 
        title: "Saldo insuficiente", 
        description: `No tienes suficiente dinero en tu saldo disponible ($${balance.toLocaleString('es-CL')}).` 
      });
      return;
    }

    // Validaciones de Ahorro
    if (type === 'saving' && selectedFund) {
      const remainingToTarget = selectedFund.targetAmount - selectedFund.currentAmount;
      if (numAmount > remainingToTarget) {
        toast({ 
          variant: "destructive", 
          title: "Excede la meta", 
          description: `Solo faltan $${remainingToTarget.toLocaleString('es-CL')} para completar esta meta.` 
        });
        return;
      }
    }

    // Validaciones de Gasto desde Meta
    if (type === 'expense' && fundId && fundId !== 'none' && selectedFund) {
      if (subBudgetId && selectedSubBudget) {
        const availableInSub = selectedSubBudget.amount - selectedSubBudget.spent;
        if (numAmount > availableInSub) {
          toast({ 
            variant: "destructive", 
            title: "Presupuesto insuficiente", 
            description: `En "${selectedSubBudget.name}" solo quedan $${availableInSub.toLocaleString('es-CL')}.` 
          });
          return;
        }
      } else if (!subBudgetId) {
        if (numAmount > selectedFund.currentAmount) {
          toast({ 
            variant: "destructive", 
            title: "Ahorro insuficiente", 
            description: `Esta meta solo tiene $${selectedFund.currentAmount.toLocaleString('es-CL')} disponibles.` 
          });
          return;
        }
      }
    }

    onAdd({
      type,
      amount: numAmount,
      category: type === "saving" ? "Ahorro Meta" : category,
      description: description || (type === "saving" ? "Aporte a meta" : ""),
      date: new Date().toISOString(),
      fundId: (type === "expense" || type === "saving") ? fundId : undefined,
      subBudgetId: type === "expense" ? subBudgetId : undefined,
    });
    setOpen(false);
    resetForm();
    toast({ title: "Registro exitoso", description: "La transacción se ha guardado correctamente." });
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setDescription("");
    setFundId(undefined);
    setSubBudgetId(undefined);
  };

  const categories = type === "income" 
    ? ["Salario", "Ventas", "Intereses", "Otros"]
    : ["Comida", "Transporte", "Ocio", "Salud", "Cuentas", "Otros"];

  const getButtonConfig = () => {
    switch(type) {
      case 'income':
        return { 
          label: "Registrar Ingreso", 
          icon: <ArrowUpCircle className="h-5 w-5" />,
          className: "bg-emerald-600 text-white hover:bg-emerald-700" 
        };
      case 'saving':
        return { 
          label: "Destinar a Ahorro", 
          icon: <PiggyBank className="h-5 w-5" />,
          className: "bg-accent text-accent-foreground hover:bg-accent/90" 
        };
      default:
        return { 
          label: "Registrar Gasto", 
          icon: <ArrowDownCircle className="h-5 w-5" />,
          className: "border-rose-200 text-rose-700 hover:bg-rose-50" 
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button 
          variant={type === "income" || type === "saving" ? "default" : "outline"} 
          className={`gap-2 w-full md:w-auto h-12 rounded-xl transition-all shadow-sm font-bold ${config.className}`}
        >
          {config.icon}
          {config.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center gap-2">
            {config.icon} {config.label}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Monto en Pesos ($)</Label>
              {type !== 'income' && (
                <span className="text-[10px] font-bold text-muted-foreground">
                  Disponible: ${balance.toLocaleString('es-CL')}
                </span>
              )}
            </div>
            <Input
              id="amount"
              type="number"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 50000"
              className="h-11 text-lg font-bold"
            />
          </div>
          
          {type !== "saving" && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoría General</Label>
              <Select required value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === "expense" || type === "saving") && (
            <div className="space-y-2">
              <Label htmlFor="fund">
                {type === "saving" ? "Seleccionar Meta de Destino" : "Gasto asociado a Meta (Opcional)"}
              </Label>
              <Select required={type === "saving"} value={fundId} onValueChange={setFundId}>
                <SelectTrigger className="h-11 border-accent/50 bg-accent/5">
                  <SelectValue placeholder={type === "saving" ? "Elige una meta" : "Ninguna (Gasto de la Wallet)"} />
                </SelectTrigger>
                <SelectContent>
                  {type === "expense" && <SelectItem value="none">Ninguna</SelectItem>}
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.name} (Cupo: ${ (fund.targetAmount - fund.currentAmount).toLocaleString('es-CL') })
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "expense" && fundId && fundId !== "none" && selectedFund && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Label htmlFor="subBudget" className="text-accent-foreground font-bold">Subdivisión de la Meta</Label>
              <Select required value={subBudgetId} onValueChange={setSubBudgetId}>
                <SelectTrigger className="h-11 border-accent bg-accent/10">
                  <SelectValue placeholder="¿De qué subdivisión descontar?" />
                </SelectTrigger>
                <SelectContent>
                  {selectedFund.subBudgets.map((sb) => (
                    <SelectItem key={sb.id} value={sb.id}>
                      {sb.name} (Saldo: ${ (sb.amount - sb.spent).toLocaleString('es-CL') })
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "saving" ? "Ej. Ahorro del mes" : "Ej. Pago reserva Airbnb"}
              className="h-11"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className={`w-full h-12 font-bold text-lg ${config.className}`}>
              Confirmar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
