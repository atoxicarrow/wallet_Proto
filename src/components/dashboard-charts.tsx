
"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DashboardChartsProps {
  transactions: any[];
}

export function DashboardCharts({ transactions }: DashboardChartsProps) {
  // Datos para el gráfico de torta (Gastos por Categoría)
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  // Generar datos reales para el gráfico de barras por mes
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentYear = new Date().getFullYear();
  
  const monthlyAggregated = transactions.reduce((acc: any, t) => {
    const date = new Date(t.date);
    if (date.getFullYear() === currentYear) {
      const monthIdx = date.getMonth();
      const monthName = months[monthIdx];
      
      if (!acc[monthName]) {
        acc[monthName] = { name: monthName, ingresos: 0, gastos: 0 };
      }
      
      if (t.type === 'income') acc[monthName].ingresos += t.amount;
      if (t.type === 'expense') acc[monthName].gastos += t.amount;
    }
    return acc;
  }, {});

  // Ordenar y filtrar solo meses que tengan datos o mostrar los últimos 6 meses
  const barData = months
    .map(m => monthlyAggregated[m] || { name: m, ingresos: 0, gastos: 0 })
    .filter((d, i) => {
      const currentMonth = new Date().getMonth();
      return i <= currentMonth && i > currentMonth - 6;
    });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-headline">Distribución de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic">
                No hay datos suficientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-headline">Ingresos vs Gastos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {barData.some(d => d.ingresos > 0 || d.gastos > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString('es-CL')}`} />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-CL')}`} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ingresos" />
                  <Bar dataKey="gastos" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground italic">
                Sin actividad este año
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
