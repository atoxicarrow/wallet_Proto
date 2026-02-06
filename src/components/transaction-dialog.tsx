
"use client";

import { useState } from "react";
import { PlusCircle, PiggyBank, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
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
import { TransactionType, Fund } from "@/lib/store";

interface TransactionDialogProps {
  type: TransactionType;
  funds: Fund[];
  onAdd: (transaction: any) => void;
}

export function TransactionDialog({ type, funds, onAdd }: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [fundId, setFundId] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      type,
      amount: parseFloat(amount),
      category: type === "saving" ? "Ahorro Meta" : category,
      description: description || (type === "saving" ? "Aporte a meta" : ""),
      date: new Date().toISOString(),
      fundId: (type === "expense" || type === "saving") ? fundId : undefined,
    });
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setDescription("");
    setFundId(undefined);
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
            <Label htmlFor="amount">Monto en Pesos ($)</Label>
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
              <Label htmlFor="category">Categoría</Label>
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
                {type === "saving" ? "Seleccionar Meta de Destino" : "Descontar de Meta (Opcional)"}
              </Label>
              <Select required={type === "saving"} value={fundId} onValueChange={setFundId}>
                <SelectTrigger className="h-11 border-accent/50 bg-accent/5">
                  <SelectValue placeholder={type === "saving" ? "Elige una meta" : "Ninguna (Gasto general)"} />
                </SelectTrigger>
                <SelectContent>
                  {type === "expense" && <SelectItem value="none">Ninguna</SelectItem>}
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.name} (Llevas: ${fund.currentAmount.toLocaleString('es-CL')})
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
              placeholder={type === "saving" ? "Ej. Ahorro del mes" : "Ej. Compra supermercado"}
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
