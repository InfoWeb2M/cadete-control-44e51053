import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api";
import { getNow } from "@/lib/study";
import type {
  BlocoQuestoesResponse,
  SimuladoSemanalResponse,
} from "@/lib/types";
import CardRecomendacao from "@/components/dashboard/CardRecomendacao";
import {
  WeeklyGoals,
  StudySuggestions,
} from "@/components/dashboard/WeeklyGoals";
import { goalVariant } from "@/lib/goals";
import KpiCard from "@/components/dashboard/KpiCard";
import MissionStatus from "@/components/dashboard/MissionStatus";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import PieChartMaterias from "@/components/dashboard/PieChartMaterias";
import {
  MediaRedacoesCard,
  ProgressoRedacoesChart,
  UltimaRedacaoCard,
} from "@/components/dashboard/RedacaoCards";
import { MateriaSelect } from "@/components/form/Selectors";
import AppLayout from "@/components/layout/AppLayout";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useAssuntos } from "@/hooks/useConfiguracoes";
import {
  useBlocos,
  useDashboard,
  useMateriasPerformance,
  useSimulados,
} from "@/hooks/usePerformance";
import type { Periodo } from "@/lib/types";
import { formatarHoras } from "@/lib/utils";
import { Clock, ListChecks, Percent, TrendingUp } from "lucide-react";
import { useState } from "react";

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
  { value: "total", label: "Total" },
];

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [materiaId, setMateriaId] = useState<string>("");

  const {
    data: dashboard,
    isLoading,
    isError,
  } = useDashboard(periodo, materiaId);
  const suggestion = useQuery({
    queryKey: ["estudos", "agora"],
    queryFn: getNow,
  });
  const series = useQuery({
    queryKey: ["performance", "series", periodo, materiaId],
    queryFn: () =>
      request<{
        blocos: BlocoQuestoesResponse[];
        simulados: SimuladoSemanalResponse[];
      }>(
        `/api/v1/estudos/series?periodo=${periodo}${materiaId ? `&materia_id=${materiaId}` : ""}`,
      ),
  });
  const blocos = series.data?.blocos,
    simulados = series.data?.simulados;
  const { data: materiasPerformance, isLoading: materiasLoading } =
    useMateriasPerformance(periodo);
  const { data: assuntos } = useAssuntos();

  const getAssuntoNome = (id: string) =>
    assuntos?.find((a) => a.id === id)?.nome ?? id;

  if (isLoading)
    return (
      <AppLayout>
        <LoadingState message="Carregando painel estratégico..." />
      </AppLayout>
    );
  if (isError)
    return (
      <AppLayout>
        <ErrorState message="Falha ao carregar o dashboard." />
      </AppLayout>
    );

  const d = dashboard!;

  const agora = new Date();
  let inicioPeriodo = new Date(2000, 0, 1);

  if (periodo === "semana") {
    const dia = agora.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    inicioPeriodo = new Date(agora);
    inicioPeriodo.setDate(agora.getDate() + diff);
    inicioPeriodo.setHours(0, 0, 0, 0);
  }
  if (periodo === "mes") {
    inicioPeriodo = new Date(agora.getFullYear(), agora.getMonth(), 1);
  }
  if (periodo === "ano") {
    inicioPeriodo = new Date(agora.getFullYear(), 0, 1);
  }

  const blocosFiltrados = blocos || []; // Período já delimitado pela API no fuso de estudo.

  const blocosMateria = blocosFiltrados.filter(
    (b) => !materiaId || b.materia_id === materiaId,
  );

  const precisionData = blocosMateria.reverse().map((b, i) => ({
    label: `B${i + 1}`,
    value: b.percentual_acerto,
  }));

  const simuladosFiltrados = simulados || [];

  const simuladoData = simuladosFiltrados
    .slice(0, 10)
    .reverse()
    .map((s) => ({
      label: `C${s.numero_ciclo}S${s.numero_semana}`,
      value: s.percentual_acerto,
    }));

  const statusToVariant = (status: string) =>
    status === "ACIMA"
      ? ("success" as const)
      : status === "ABAIXO"
        ? ("critical" as const)
        : status === "DENTRO"
          ? ("warning" as const)
          : goalVariant(status);

  const tendenciaVariant =
    d.tendencia === "ASCENDENTE"
      ? ("success" as const)
      : d.tendencia === "DECLÍNIO"
        ? ("critical" as const)
        : ("default" as const);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="page-title">Painel de Comando</h1>
          <p className="page-subtitle">
            Monitoramento de Performance Acadêmica
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            className="form-select w-auto min-w-[100px]"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <MateriaSelect
            value={materiaId}
            onChange={setMateriaId}
            className="form-select w-auto min-w-[120px]"
          />
        </div>
      </div>

      <div className="tac-card mb-6 border-accent/40">
        <p className="text-xs text-accent uppercase tracking-wider mb-2">
          Próxima sessão
        </p>
        <p className="text-sm mb-3">
          {suggestion.data?.recomendacao
            ? `${suggestion.data.recomendacao.materia} · ${suggestion.data.recomendacao.assunto}`
            : "Retome seu ciclo com uma matéria, assunto e atividade definidos."}
        </p>
        <Link to="/estudar" className="btn-tactical inline-flex">
          Estudar agora
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 stagger-children">
        <KpiCard
          title="Horas Líquidas"
          value={formatarHoras(d.horas_liquidas)}
          meta={d.meta_horas ? `${d.meta_horas}h` : undefined}
          icon={Clock}
          variant={statusToVariant(d.status_horas)}
          subtitle={d.status_horas}
        />
        <KpiCard
          title="Questões Resolvidas"
          value={d.total_questoes}
          meta={d.meta_questoes || undefined}
          icon={ListChecks}
          variant={statusToVariant(d.status_questoes)}
          subtitle={d.status_questoes}
        />
        <KpiCard
          title="Precisão observada"
          value={d.tem_evidencia ? `${d.percentual_medio}%` : "—"}
          icon={Percent}
          variant="default"
          subtitle={
            d.tem_evidencia
              ? `${d.total_acertos} acertos / ${d.total_questoes} questões`
              : "Sem questões no período"
          }
        />
        <KpiCard
          title="Tendência"
          value={d.tendencia}
          icon={TrendingUp}
          variant={tendenciaVariant}
        />
      </div>

      {series.isError && (
        <ErrorState message="Falha ao carregar as séries dos gráficos." />
      )}
      <WeeklyGoals />
      {d.contexto_meta && (
        <p className="text-xs text-muted-foreground mb-3">{d.contexto_meta}</p>
      )}

      <CardRecomendacao d={d} />

      {/* Mission Status + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <MissionStatus
          status={d.status_missao}
          variant={d.variante_missao}
          tendencia={d.tendencia}
          assuntosCriticos={d.assuntos_criticos.map(getAssuntoNome)}
        />
        <PerformanceChart
          title="Precisão por Bloco (até 100 recentes)"
          data={precisionData}
          type="line"
          color="hsl(43, 70%, 50%)"
          unit="%"
        />
        <PerformanceChart
          title="Simulados globais (10 recentes)"
          data={simuladoData}
          type="bar"
          color="hsl(90, 40%, 35%)"
          unit="%"
        />
      </div>

      {/* IPR por Matéria */}
      <div className="mb-6">
        <PieChartMaterias data={materiasPerformance || []} />
      </div>

      {/* Redações */}
      <StudySuggestions />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <UltimaRedacaoCard />
        <MediaRedacoesCard />
        <ProgressoRedacoesChart />
      </div>
    </AppLayout>
  );
}
