import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useSessoes, useBlocos } from "@/hooks/usePerformance";
import { useMaterias } from "@/hooks/useConfiguracoes";

function getIprColor(ipr: number): string {
  if (ipr >= 80) return "hsl(var(--success))";
  if (ipr >= 70) return "hsl(var(--warning))";
  return "hsl(var(--critical))";
}

export function HorasPorMateriaChart() {
  const { data: sessoes } = useSessoes();
  const { data: materias } = useMaterias();

  const chartData = useMemo(() => {
    if (!sessoes?.length || !materias?.length) return [];
    const map = new Map<string, number>();
    for (const s of sessoes) {
      map.set(s.materia_id, (map.get(s.materia_id) || 0) + s.minutos_liquidos);
    }
    return materias
      .filter((m) => map.has(m.id))
      .map((m) => ({
        nome: m.nome,
        horas: Math.round(((map.get(m.id) || 0) / 60) * 10) / 10,
      }))
      .sort((a, b) => b.horas - a.horas);
  }, [sessoes, materias]);

  if (!chartData.length) return null;

  return (
    <div className="rounded-md border border-border bg-card p-5 animate-slide-in">
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-4">
        Horas por Matéria
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="nome"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "4px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`${value}h`, "Horas"]}
            />
            <Bar dataKey="horas" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function IprPorMateriaChart() {
  const { data: blocos } = useBlocos();
  const { data: materias } = useMaterias();

  const chartData = useMemo(() => {
    if (!blocos?.length || !materias?.length) return [];
    const acertos = new Map<string, { total: number; corretos: number }>();
    for (const b of blocos) {
      const cur = acertos.get(b.materia_id) || { total: 0, corretos: 0 };
      cur.total += b.total_questoes;
      cur.corretos += b.total_acertos;
      acertos.set(b.materia_id, cur);
    }
    return materias
      .filter((m) => acertos.has(m.id))
      .map((m) => {
        const d = acertos.get(m.id)!;
        const ipr = d.total > 0 ? Math.round((d.corretos / d.total) * 100) : 0;
        return { nome: m.nome, ipr };
      })
      .sort((a, b) => a.ipr - b.ipr);
  }, [blocos, materias]);

  if (!chartData.length) return null;

  return (
    <div className="rounded-md border border-border bg-card p-5 animate-slide-in">
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-4">
        IPR por Matéria
      </p>
      <div style={{ height: Math.max(200, chartData.length * 32) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "4px",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`${value}%`, "IPR"]}
            />
            <Bar dataKey="ipr" radius={[0, 2, 2, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={getIprColor(entry.ipr)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
