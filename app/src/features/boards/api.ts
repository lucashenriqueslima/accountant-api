import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Board, BoardWithColumns, Card } from '@/types';

export const boardKeys = {
  all: ['boards'] as const,
  mine: ['boards', 'mine'] as const,
  detail: (id: string) => ['boards', id] as const,
};

// Quadros da equipe (admin/gestor).
export function useBoards() {
  return useQuery({
    queryKey: boardKeys.all,
    queryFn: () => api.get<Board[]>('/boards'),
  });
}

export function useBoard(id: string | undefined, assigneeId?: string) {
  return useQuery({
    queryKey: [...boardKeys.detail(id ?? ''), assigneeId ?? 'all'],
    queryFn: () =>
      api.get<BoardWithColumns>(
        `/boards/${id}${assigneeId ? `?assigneeId=${assigneeId}` : ''}`,
      ),
    enabled: Boolean(id),
  });
}

// "Meu board" — quadros com os cartões atribuídos ao usuário atual.
export function useMyBoards() {
  return useQuery({
    queryKey: boardKeys.mine,
    queryFn: () => api.get<BoardWithColumns[]>('/boards/mine'),
  });
}

interface MoveCardInput {
  cardId: string;
  columnId: string;
  position: number;
}

export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, columnId, position }: MoveCardInput) =>
      api.patch<Card>(`/cards/${cardId}/move`, { columnId, position }),
    // Invalida tudo de boards (meu board e quadros da equipe).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.all }),
  });
}
