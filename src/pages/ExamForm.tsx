import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { createSimulado } from "@/lib/api";
import type { SimuladoSemanalCreate } from "@/lib/types";

export default function ExamForm() {
  const queryClient = useQueryClient();
  const [ciclo, setCiclo] = useState("");
  const [semana, setSemana] = useState("");
  const [totalQ, setTotalQ] = useState("");
  const [totalA, setTotalA] = useState("");
  const [tempo, setTempo] = useState("");
  const [ansiedade, setAnsiedade] = useState(3);
  const [fadiga, setFadiga] = useState(3);
  const [sono, setSono] = useState(3);
  const [resultado, setResultado] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: createSimulado,
    onSuccess: (data) => {
      setResultado(data.percentual_acerto);
      toast.success(`Simulado registrado: ${data.percentual_acerto}%`);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["simulados"] });
    },
    onError: () => toast.error("Erro ao registrar simulado."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);
    if (!ciclo || !semana || !totalQ || !totalA || !tempo) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const tq = parseInt(totalQ);
    const ta = parseInt(totalA);
    if (ta > tq) { toast.error("Acertos não podem ser maiores que o total."); return; }

    const data: SimuladoSemanalCreate = {
      numero_ciclo: parseInt(ciclo),
      numero_semana: parseInt(semana),
      total_questoes: tq,
      total_acertos: ta,
      tempo_total_segundos: parseInt(tempo) * 60,
      nivel_ansiedade: ansiedade,
      nivel_fadiga: fadiga,
      qualidade_sono: sono,
    };
    mutation.mutate(data);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-wider text-foreground uppercase mb-1">
          Registrar Simulado Semanal
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Simule ambiente de pressão e monitore evolução.</p>

        {resultado !== null && (
          <div className={`mb-6 p-4 rounded-md border ${resultado >= 70 ? "border-success/50 bg-success/10" : "border-critical/50 bg-critical/10"}`}>
            <p className={`text-lg font-bold font-mono ${resultado >= 70 ? "text-success" : "text-critical"}`}>
              {resultado}% de acerto
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Número do Ciclo">
              <input type="number" min={1} value={ciclo} onChange={(e) => setCiclo(e.target.value)} className="form-input" placeholder="Ex: 1" />
            </FieldGroup>
            <FieldGroup label="Número da Semana">
              <select value={semana} onChange={(e) => setSemana(e.target.value)} className="form-select">
                <option value="">Selecione...</option>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Semana {n}</option>)}
              </select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Total de Questões">
              <input type="number" min={1} value={totalQ} onChange={(e) => setTotalQ(e.target.value)} className="form-input" placeholder="Ex: 60" />
            </FieldGroup>
            <FieldGroup label="Total de Acertos">
              <input type="number" min={0} value={totalA} onChange={(e) => setTotalA(e.target.value)} className="form-input" placeholder="Ex: 45" />
            </FieldGroup>
          </div>

          <FieldGroup label="Tempo Total (minutos)">
            <input type="number" min={1} value={tempo} onChange={(e) => setTempo(e.target.value)} className="form-input" placeholder="Ex: 180" />
          </FieldGroup>

          <div className="grid grid-cols-3 gap-4">
            <FieldGroup label={`Ansiedade: ${ansiedade}`}>
              <input type="range" min={1} max={5} value={ansiedade} onChange={(e) => setAnsiedade(+e.target.value)} className="w-full accent-accent" />
            </FieldGroup>
            <FieldGroup label={`Fadiga: ${fadiga}`}>
              <input type="range" min={1} max={5} value={fadiga} onChange={(e) => setFadiga(+e.target.value)} className="w-full accent-accent" />
            </FieldGroup>
            <FieldGroup label={`Qualidade do Sono: ${sono}`}>
              <input type="range" min={1} max={5} value={sono} onChange={(e) => setSono(+e.target.value)} className="w-full accent-accent" />
            </FieldGroup>
          </div>

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold tracking-wider uppercase text-sm hover:bg-olive-light transition-colors disabled:opacity-50">
            {mutation.isPending ? "Registrando..." : "Registrar Simulado"}
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
