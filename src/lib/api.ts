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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
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

// ---- Dashboard ----
export async function fetchDashboard(periodo: Periodo, materiaId?: string): Promise<DashboardResumo> {
  const params = new URLSearchParams({ periodo });
  if (materiaId) params.set("materia_id", materiaId);
  return request(`/api/v1/performance/dashboard?${params}`);
}

// ---- Sessões ----
export async function createSessao(data: SessaoEstudoCreate): Promise<SessaoEstudoResponse> {
  return request("/api/v1/performance/sessoes", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchSessoes(skip = 0, limit = 100): Promise<SessaoEstudoResponse[]> {
  return request(`/api/v1/performance/sessoes?skip=${skip}&limit=${limit}`);
}

// ---- Blocos ----
export async function createBloco(data: BlocoQuestoesCreate): Promise<BlocoQuestoesResponse> {
  return request("/api/v1/performance/blocos", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchBlocos(skip = 0, limit = 100): Promise<BlocoQuestoesResponse[]> {
  return request(`/api/v1/performance/blocos?skip=${skip}&limit=${limit}`);
}

// ---- Simulados ----
export async function createSimulado(data: SimuladoSemanalCreate): Promise<SimuladoSemanalResponse> {
  return request("/api/v1/performance/simulados", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchSimulados(skip = 0, limit = 100): Promise<SimuladoSemanalResponse[]> {
  return request(`/api/v1/performance/simulados?skip=${skip}&limit=${limit}`);
}
