import { useQuery } from "@tanstack/react-query";
import { fetchMaterias, fetchAssuntosPorMateria } from "@/lib/api";

export function useMaterias() {
  return useQuery({
    queryKey: ["configuracoes", "materias"],
    queryFn: fetchMaterias,
    staleTime: 1000 * 60 * 10, // 10 min cache
  });
}

export function useAssuntosPorMateria(materiaId: string | undefined) {
  return useQuery({
    queryKey: ["configuracoes", "assuntos", materiaId],
    queryFn: () => fetchAssuntosPorMateria(materiaId!),
    enabled: !!materiaId,
    staleTime: 1000 * 60 * 10,
  });
}
