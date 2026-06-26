import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toQueryString, type ListParams } from '@/lib/query-string';
import type { Card, CardWithActivities, Column, Priority } from '@/types';

export const cardKeys = {
  all: ['cards'] as const,
  list: (params: ListParams) => ['cards', 'list', params] as const,
  detail: (id: string) => ['cards', id] as const,
};

export interface CardInput {
  title: string;
  description?: string;
  columnId: string;
  clientId?: string | null;
  assigneeId?: string | null;
  priority: Priority;
  dueDate?: string | null;
  position?: number;
}

export function useCards(params: ListParams = {}) {
  return useQuery({
    queryKey: cardKeys.list(params),
    queryFn: () => api.get<Card[]>(`/cards${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useCard(id: string | undefined) {
  return useQuery({
    queryKey: cardKeys.detail(id ?? ''),
    queryFn: () => api.get<CardWithActivities>(`/cards/${id}`),
    enabled: Boolean(id),
  });
}

// Colunas de um quadro (para escolher onde criar a tarefa).
export function useBoardColumns(boardId: string | undefined) {
  return useQuery({
    queryKey: ['columns', boardId],
    queryFn: () => api.get<Column[]>(`/columns?boardId=${boardId}`),
    enabled: Boolean(boardId),
  });
}

function invalidateCards(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: cardKeys.all });
  queryClient.invalidateQueries({ queryKey: ['boards'] });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CardInput) => api.post<Card>('/cards', input),
    onSuccess: () => invalidateCards(queryClient),
  });
}

export function useUpdateCard(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CardInput>) => api.patch<Card>(`/cards/${id}`, input),
    onSuccess: () => {
      invalidateCards(queryClient);
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(id) });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/cards/${id}`),
    onSuccess: () => invalidateCards(queryClient),
  });
}
