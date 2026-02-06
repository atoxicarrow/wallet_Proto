
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
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
      category,
      description,
      date: new Date().toISOString(),
      fundId: type === "expense" ? fundId : undefined,
    });
    setOpen(false);
    setAmount("");
    setCategory("");
    setDescription("");
    setFundId(undefined);
  };

  const categories = type === "income" 
    ? ["Salario", "Ventas", "Intereses", "Otros"]
    : ["Comida", "Transporte", "Ocio", "Salud", "Ahorros", "Otros"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={type === "income" ? "default" : "outline"} 
          className={`gap-2 w-full md:w-auto h-12 rounded-xl transition-all shadow-sm ${type === 'income' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-accent text-accent-foreground hover:bg-accent/10'}`}
        >
          <PlusCircle className="h-5 w-5" />
          {type === "income" ? "Registrar Ingreso" : "Registrar Gasto"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {type === "income" ? "Nuevo Ingreso" : "Nuevo Gasto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Cantidad ($)</Label>
            <Input
              id="amount"
              type="number"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-11"
            />
          </div>
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
          {type === "expense" && funds.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="fund">Asignar a Meta de Ahorro (Opcional)</Label>
              <Select value={fundId} onValueChange={setFundId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Ninguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.name} (Restante: ${Math.max(0, fund.allocatedAmount - fund.spentAmount).toLocaleString('es-CL')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Pago de sueldo"
              className="h-11"
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90">
              Guardar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
