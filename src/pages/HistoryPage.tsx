import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { fetchSessoes, fetchBlocos, fetchSimulados } from "@/lib/api";
import { getMateriaNome, getAssuntoNome } from "@/lib/data";

type Tab = "sessoes" | "blocos" | "simulados";

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>("sessoes");

  const { data: sessoes } = useQuery({ queryKey: ["sessoes"], queryFn: () => fetchSessoes() });
  const { data: blocos } = useQuery({ queryKey: ["blocos"], queryFn: () => fetchBlocos() });
  const { data: simulados } = useQuery({ queryKey: ["simulados"], queryFn: () => fetchSimulados() });

  const tabs: { key: Tab; label: string }[] = [
    { key: "sessoes", label: "Sessões" },
    { key: "blocos", label: "Blocos" },
    { key: "simulados", label: "Simulados" },
  ];

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold tracking-wider text-foreground uppercase mb-1">Histórico</h1>
      <p className="text-sm text-muted-foreground mb-6">Registros completos de execução.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors ${
              tab === t.key
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sessões */}
      {tab === "sessoes" && (
        <div className="space-y-2">
          {(!sessoes || sessoes.length === 0) ? (
            <EmptyState />
          ) : (
            sessoes.map((s) => (
              <div key={s.id} className="rounded-md border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{getMateriaNome(s.materia_id)} — {getAssuntoNome(s.assunto_id)}</p>
                  <p className="text-xs text-muted-foreground">{s.tipo_sessao} • {s.minutos_liquidos} min • Foco: {s.nivel_foco ?? "—"} • Energia: {s.nivel_energia ?? "—"}</p>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{new Date(s.criado_em).toLocaleDateString("pt-BR")}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blocos */}
      {tab === "blocos" && (
        <div className="space-y-2">
          {(!blocos || blocos.length === 0) ? (
            <EmptyState />
          ) : (
            blocos.map((b) => (
              <div key={b.id} className="rounded-md border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{getMateriaNome(b.materia_id)} — {getAssuntoNome(b.assunto_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.total_acertos}/{b.total_questoes} • Dif: {b.dificuldade} • {Math.round(b.tempo_total_segundos / 60)}min
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold font-mono ${b.percentual_acerto >= 70 ? "text-success" : "text-critical"}`}>
                    {b.percentual_acerto}%
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{new Date(b.criado_em).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Simulados */}
      {tab === "simulados" && (
        <div className="space-y-2">
          {(!simulados || simulados.length === 0) ? (
            <EmptyState />
          ) : (
            simulados.map((s) => (
              <div key={s.id} className="rounded-md border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Ciclo {s.numero_ciclo} — Semana {s.numero_semana}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.total_acertos}/{s.total_questoes} • {Math.round(s.tempo_total_segundos / 60)}min • Ans: {s.nivel_ansiedade ?? "—"} • Fad: {s.nivel_fadiga ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold font-mono ${s.percentual_acerto >= 70 ? "text-success" : "text-critical"}`}>
                    {s.percentual_acerto}%
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">{new Date(s.criado_em).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
      <p className="text-xs text-muted-foreground mt-1">Comece registrando suas atividades.</p>
    </div>
  );
}
