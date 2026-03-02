import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { createSessao } from "@/lib/api";
import { MATERIAS, getAssuntosByMateria } from "@/lib/data";
import type { SessaoEstudoCreate } from "@/lib/types";

export default function SessionForm() {
  const queryClient = useQueryClient();
  const [materiaId, setMateriaId] = useState("");
  const [assuntoId, setAssuntoId] = useState("");
  const [tipo, setTipo] = useState<"TEORIA" | "QUESTOES" | "REVISAO">("TEORIA");
  const [minutos, setMinutos] = useState("");
  const [foco, setFoco] = useState(3);
  const [energia, setEnergia] = useState(3);

  const assuntos = materiaId ? getAssuntosByMateria(materiaId) : [];

  const mutation = useMutation({
    mutationFn: createSessao,
    onSuccess: () => {
      toast.success("Sessão registrada com sucesso!", { description: "Dashboard atualizado." });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sessoes"] });
      setMateriaId("");
      setAssuntoId("");
      setMinutos("");
      setFoco(3);
      setEnergia(3);
    },
    onError: () => toast.error("Erro ao registrar sessão."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaId || !assuntoId || !minutos) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const data: SessaoEstudoCreate = {
      materia_id: materiaId,
      assunto_id: assuntoId,
      tipo_sessao: tipo,
      minutos_liquidos: parseInt(minutos),
      nivel_foco: foco,
      nivel_energia: energia,
    };
    mutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-wider text-foreground uppercase mb-1">
          Registrar Sessão de Estudo
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Registre cada sessão para monitoramento estratégico.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Matéria */}
          <FieldGroup label="Matéria">
            <select value={materiaId} onChange={(e) => { setMateriaId(e.target.value); setAssuntoId(""); }} className="form-select">
              <option value="">Selecione...</option>
              {MATERIAS.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </FieldGroup>

          {/* Assunto */}
          <FieldGroup label="Assunto">
            <select value={assuntoId} onChange={(e) => setAssuntoId(e.target.value)} className="form-select" disabled={!materiaId}>
              <option value="">Selecione...</option>
              {assuntos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </FieldGroup>

          {/* Tipo */}
          <FieldGroup label="Tipo de Sessão">
            <div className="flex gap-2">
              {(["TEORIA", "QUESTOES", "REVISAO"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`px-4 py-2 rounded-md text-xs font-medium border transition-all ${
                    tipo === t ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
                  }`}
                >
                  {t === "QUESTOES" ? "Questões" : t === "REVISAO" ? "Revisão" : "Teoria"}
                </button>
              ))}
            </div>
          </FieldGroup>

          {/* Minutos */}
          <FieldGroup label="Minutos Líquidos">
            <input type="number" min={1} value={minutos} onChange={(e) => setMinutos(e.target.value)} className="form-input" placeholder="Ex: 45" />
          </FieldGroup>

          {/* Foco & Energia */}
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label={`Nível de Foco: ${foco}`}>
              <input type="range" min={1} max={5} value={foco} onChange={(e) => setFoco(+e.target.value)} className="w-full accent-accent" />
            </FieldGroup>
            <FieldGroup label={`Nível de Energia: ${energia}`}>
              <input type="range" min={1} max={5} value={energia} onChange={(e) => setEnergia(+e.target.value)} className="w-full accent-accent" />
            </FieldGroup>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-olive-light transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Registrando..." : "Registrar Sessão"}
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
