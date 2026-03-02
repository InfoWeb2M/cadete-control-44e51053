import type {
  DashboardResumo,
  SessaoEstudoCreate,
  SessaoEstudoResponse,
  BlocoQuestoesCreate,
  BlocoQuestoesResponse,
  SimuladoSemanalCreate,
  SimuladoSemanalResponse,
  Periodo,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// If no API base URL, use mock mode
const isMock = !API_BASE;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (isMock) {
    throw new Error("MOCK_MODE");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.[0]?.msg || `Erro ${res.status}`);
  }
  return res.json();
}

// ---- Mock data store ----
const mockSessoes: SessaoEstudoResponse[] = [];
const mockBlocos: BlocoQuestoesResponse[] = [];
const mockSimulados: SimuladoSemanalResponse[] = [];

function uuid() {
  return crypto.randomUUID();
}

// ---- Dashboard ----
export async function fetchDashboard(periodo: Periodo, materiaId?: string): Promise<DashboardResumo> {
  if (isMock) {
    const totalMinutos = mockSessoes.reduce((s, x) => s + x.minutos_liquidos, 0);
    const totalQ = mockBlocos.reduce((s, x) => s + x.total_questoes, 0);
    const totalA = mockBlocos.reduce((s, x) => s + x.total_acertos, 0);
    const pct = totalQ > 0 ? (totalA / totalQ) * 100 : 0;
    const criticos = mockBlocos
      .filter((b) => b.percentual_acerto < 70)
      .map((b) => b.assunto_id);
    
    return {
      horas_liquidas: Math.round((totalMinutos / 60) * 100) / 100,
      total_questoes: totalQ,
      percentual_medio: Math.round(pct * 100) / 100,
      ipr_geral: Math.round(pct * 100) / 100,
      tendencia: mockSimulados.length >= 2
        ? mockSimulados[mockSimulados.length - 1].percentual_acerto > mockSimulados[mockSimulados.length - 2].percentual_acerto
          ? "ASCENDENTE"
          : "DECLÍNIO"
        : "ESTÁVEL",
      status_missao: pct >= 70 ? "MISSÃO CUMPRIDA" : "EXECUÇÃO INSUFICIENTE",
      assuntos_criticos: [...new Set(criticos)],
    };
  }
  const params = new URLSearchParams({ periodo });
  if (materiaId) params.set("materia_id", materiaId);
  return request(`/api/v1/performance/dashboard?${params}`);
}

// ---- Sessões ----
export async function createSessao(data: SessaoEstudoCreate): Promise<SessaoEstudoResponse> {
  if (isMock) {
    const r: SessaoEstudoResponse = {
      ...data,
      id: uuid(),
      data: data.data || new Date().toISOString(),
      criado_em: new Date().toISOString(),
    };
    mockSessoes.push(r);
    return r;
  }
  return request("/api/v1/performance/sessoes", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchSessoes(skip = 0, limit = 100): Promise<SessaoEstudoResponse[]> {
  if (isMock) return mockSessoes.slice(skip, skip + limit);
  return request(`/api/v1/performance/sessoes?skip=${skip}&limit=${limit}`);
}

// ---- Blocos ----
export async function createBloco(data: BlocoQuestoesCreate): Promise<BlocoQuestoesResponse> {
  if (isMock) {
    const r: BlocoQuestoesResponse = {
      ...data,
      id: uuid(),
      data: data.data || new Date().toISOString(),
      percentual_acerto: Math.round((data.total_acertos / data.total_questoes) * 10000) / 100,
      tempo_medio_por_questao: Math.round((data.tempo_total_segundos / data.total_questoes) * 100) / 100,
      criado_em: new Date().toISOString(),
    };
    mockBlocos.push(r);
    return r;
  }
  return request("/api/v1/performance/blocos", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchBlocos(skip = 0, limit = 100): Promise<BlocoQuestoesResponse[]> {
  if (isMock) return mockBlocos.slice(skip, skip + limit);
  return request(`/api/v1/performance/blocos?skip=${skip}&limit=${limit}`);
}

// ---- Simulados ----
export async function createSimulado(data: SimuladoSemanalCreate): Promise<SimuladoSemanalResponse> {
  if (isMock) {
    const r: SimuladoSemanalResponse = {
      ...data,
      id: uuid(),
      percentual_acerto: Math.round((data.total_acertos / data.total_questoes) * 10000) / 100,
      criado_em: new Date().toISOString(),
    };
    mockSimulados.push(r);
    return r;
  }
  return request("/api/v1/performance/simulados", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchSimulados(skip = 0, limit = 100): Promise<SimuladoSemanalResponse[]> {
  if (isMock) return mockSimulados.slice(skip, skip + limit);
  return request(`/api/v1/performance/simulados?skip=${skip}&limit=${limit}`);
}
