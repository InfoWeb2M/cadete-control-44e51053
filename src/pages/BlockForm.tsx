import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { createBloco } from "@/lib/api";
import { MATERIAS, getAssuntosByMateria } from "@/lib/data";
import type { BlocoQuestoesCreate } from "@/lib/types";

export default function BlockForm() {
  const queryClient = useQueryClient();
  const [materiaId, setMateriaId] = useState("");
  const [assuntoId, setAssuntoId] = useState("");
  const [dificuldade, setDificuldade] = useState(3);
  const [totalQ, setTotalQ] = useState("");
  const [totalA, setTotalA] = useState("");
  const [tempo, setTempo] = useState("");
  const [confianca, setConfianca] = useState(3);
  const [resultado, setResultado] = useState<{ pct: number; critico: boolean } | null>(null);

  const assuntos = materiaId ? getAssuntosByMateria(materiaId) : [];

  const mutation = useMutation({
    mutationFn: createBloco,
    onSuccess: (data) => {
      const pct = data.percentual_acerto;
      const critico = pct < 70;
      setResultado({ pct, critico });
      toast.success(`Bloco registrado: ${pct}%`, {
        description: critico ? "⚠️ ASSUNTO CRÍTICO — IPR abaixo de 70%" : "Performance operacional.",
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["blocos"] });
    },
    onError: () => toast.error("Erro ao registrar bloco."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);
    if (!materiaId || !assuntoId || !totalQ || !totalA || !tempo) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const tq = parseInt(totalQ);
    const ta = parseInt(totalA);
    if (ta > tq) {
      toast.error("Acertos não podem ser maiores que o total.");
      return;
    }
    const data: BlocoQuestoesCreate = {
      materia_id: materiaId,
      assunto_id: assuntoId,
      dificuldade,
      total_questoes: tq,
      total_acertos: ta,
      tempo_total_segundos: parseInt(tempo) * 60,
      nivel_confianca_medio: confianca,
    };
    mutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-wider text-foreground uppercase mb-1">
          Registrar Bloco de Questões
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Controle seu volume e precisão por assunto.</p>

        {resultado && (
          <div className={`mb-6 p-4 rounded-md border ${resultado.critico ? "border-critical/50 bg-critical/10" : "border-success/50 bg-success/10"}`}>
            <p className={`text-lg font-bold font-mono ${resultado.critico ? "text-critical" : "text-success"}`}>
              {resultado.pct}% de acerto
            </p>
            <p className="text-xs text-muted-foreground">
              {resultado.critico ? "Assunto marcado como CRÍTICO" : "Performance dentro do esperado"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup label="Matéria">
            <select value={materiaId} onChange={(e) => { setMateriaId(e.target.value); setAssuntoId(""); }} className="form-select">
              <option value="">Selecione...</option>
              {MATERIAS.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label="Assunto">
            <select value={assuntoId} onChange={(e) => setAssuntoId(e.target.value)} className="form-select" disabled={!materiaId}>
              <option value="">Selecione...</option>
              {assuntos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label={`Dificuldade: ${dificuldade}`}>
            <input type="range" min={1} max={5} value={dificuldade} onChange={(e) => setDificuldade(+e.target.value)} className="w-full accent-accent" />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Total de Questões">
              <input type="number" min={1} value={totalQ} onChange={(e) => setTotalQ(e.target.value)} className="form-input" placeholder="Ex: 20" />
            </FieldGroup>
            <FieldGroup label="Total de Acertos">
              <input type="number" min={0} value={totalA} onChange={(e) => setTotalA(e.target.value)} className="form-input" placeholder="Ex: 15" />
            </FieldGroup>
          </div>

          <FieldGroup label="Tempo Total (minutos)">
            <input type="number" min={1} value={tempo} onChange={(e) => setTempo(e.target.value)} className="form-input" placeholder="Ex: 30" />
          </FieldGroup>

          <FieldGroup label={`Confiança Média: ${confianca}`}>
            <input type="range" min={1} max={5} value={confianca} onChange={(e) => setConfianca(+e.target.value)} className="w-full accent-accent" />
          </FieldGroup>

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-olive-light transition-colors disabled:opacity-50">
            {mutation.isPending ? "Registrando..." : "Registrar Bloco"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium tracking-wider text-muted-foreground uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}
