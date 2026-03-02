import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, ListChecks, Percent, TrendingUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import KpiCard from "@/components/dashboard/KpiCard";
import MissionStatus from "@/components/dashboard/MissionStatus";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { fetchDashboard, fetchBlocos, fetchSimulados } from "@/lib/api";
import { MATERIAS, getAssuntoNome } from "@/lib/data";
import type { Periodo } from "@/lib/types";

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
  { value: "total", label: "Total" },
];

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [materiaId, setMateriaId] = useState<string>("");

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", periodo, materiaId],
    queryFn: () => fetchDashboard(periodo, materiaId || undefined),
  });

  const { data: blocos } = useQuery({
    queryKey: ["blocos"],
    queryFn: () => fetchBlocos(),
  });

  const { data: simulados } = useQuery({
    queryKey: ["simulados"],
    queryFn: () => fetchSimulados(),
  });

  const d = dashboard || {
    horas_liquidas: 0,
    total_questoes: 0,
    percentual_medio: 0,
    ipr_geral: 0,
    tendencia: "ESTÁVEL",
    status_missao: "EXECUÇÃO INSUFICIENTE",
    assuntos_criticos: [],
  };

  // Chart data from blocos
  const precisionData = (blocos || []).slice(-10).map((b, i) => ({
    label: `B${i + 1}`,
    value: b.percentual_acerto,
  }));

  const simuladoData = (simulados || []).slice(-10).map((s) => ({
    label: `C${s.numero_ciclo}S${s.numero_semana}`,
    value: s.percentual_acerto,
  }));

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-foreground uppercase">
            Painel de Comando
          </h1>
          <p className="text-sm text-muted-foreground">Monitoramento de Performance Acadêmica</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            className="rounded-md border border-border bg-input px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            className="rounded-md border border-border bg-input px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Todas as Matérias</option>
            {MATERIAS.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Horas Líquidas"
          value={`${d.horas_liquidas}h`}
          icon={Clock}
          variant={d.horas_liquidas >= 32 ? "success" : "warning"}
          subtitle={d.horas_liquidas >= 32 ? "Meta atingida" : "Abaixo da meta (32h)"}
        />
        <KpiCard
          title="Questões Resolvidas"
          value={d.total_questoes}
          icon={ListChecks}
          variant={d.total_questoes >= 450 ? "success" : "warning"}
          subtitle={d.total_questoes >= 450 ? "Volume adequado" : "Abaixo da meta (450)"}
        />
        <KpiCard
          title="IPR Geral"
          value={`${d.ipr_geral}%`}
          icon={Percent}
          variant={d.ipr_geral >= 70 ? "success" : "critical"}
          subtitle={d.ipr_geral >= 70 ? "Performance operacional" : "Nível crítico (<70%)"}
        />
        <KpiCard
          title="Tendência"
          value={d.tendencia}
          icon={TrendingUp}
          variant={d.tendencia === "ASCENDENTE" ? "success" : d.tendencia === "DECLÍNIO" ? "critical" : "warning"}
        />
      </div>

      {/* Mission Status + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MissionStatus
          status={d.status_missao}
          tendencia={d.tendencia}
          assuntosCriticos={d.assuntos_criticos.map(getAssuntoNome)}
        />
        <PerformanceChart
          title="Precisão por Bloco"
          data={precisionData}
          type="line"
          color="hsl(43, 70%, 50%)"
          unit="%"
        />
        <PerformanceChart
          title="Desempenho em Simulados"
          data={simuladoData}
          type="bar"
          color="hsl(90, 40%, 35%)"
          unit="%"
        />
      </div>
    </AppLayout>
  );
}
