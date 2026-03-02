import type { Materia, Assunto } from "./types";

// Mock matérias and assuntos for EsPCEx
export const MATERIAS: Materia[] = [
  { id: "m1", nome: "Matemática" },
  { id: "m2", nome: "Português" },
  { id: "m3", nome: "Inglês" },
  { id: "m4", nome: "Física" },
  { id: "m5", nome: "Química" },
  { id: "m6", nome: "Geografia" },
  { id: "m7", nome: "História" },
  { id: "m8", nome: "Redação" },
];

export const ASSUNTOS: Assunto[] = [
  // Matemática
  { id: "a1", nome: "Álgebra", materia_id: "m1" },
  { id: "a2", nome: "Geometria Plana", materia_id: "m1" },
  { id: "a3", nome: "Geometria Espacial", materia_id: "m1" },
  { id: "a4", nome: "Trigonometria", materia_id: "m1" },
  { id: "a5", nome: "Probabilidade", materia_id: "m1" },
  // Português
  { id: "a6", nome: "Interpretação de Texto", materia_id: "m2" },
  { id: "a7", nome: "Gramática", materia_id: "m2" },
  { id: "a8", nome: "Literatura", materia_id: "m2" },
  // Inglês
  { id: "a9", nome: "Interpretação", materia_id: "m3" },
  { id: "a10", nome: "Gramática Inglesa", materia_id: "m3" },
  // Física
  { id: "a11", nome: "Mecânica", materia_id: "m4" },
  { id: "a12", nome: "Termodinâmica", materia_id: "m4" },
  { id: "a13", nome: "Óptica", materia_id: "m4" },
  { id: "a14", nome: "Eletricidade", materia_id: "m4" },
  // Química
  { id: "a15", nome: "Química Orgânica", materia_id: "m5" },
  { id: "a16", nome: "Química Inorgânica", materia_id: "m5" },
  { id: "a17", nome: "Estequiometria", materia_id: "m5" },
  // Geografia
  { id: "a18", nome: "Geopolítica", materia_id: "m6" },
  { id: "a19", nome: "Cartografia", materia_id: "m6" },
  // História
  { id: "a20", nome: "História do Brasil", materia_id: "m7" },
  { id: "a21", nome: "História Geral", materia_id: "m7" },
  // Redação
  { id: "a22", nome: "Dissertação", materia_id: "m8" },
];

export function getAssuntosByMateria(materiaId: string): Assunto[] {
  return ASSUNTOS.filter((a) => a.materia_id === materiaId);
}

export function getMateriaNome(id: string): string {
  return MATERIAS.find((m) => m.id === id)?.nome ?? id;
}

export function getAssuntoNome(id: string): string {
  return ASSUNTOS.find((a) => a.id === id)?.nome ?? id;
}
