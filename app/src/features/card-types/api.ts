import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CardType } from '@/types';

export const cardTypeKeys = {
  all: ['card-types'] as const,
};

export interface CardTypeInput {
  title: string;
}

export function useCardTypes() {
  return useQuery({
    queryKey: cardTypeKeys.all,
    queryFn: () => api.get<CardType[]>('/card-types'),
  });
}

export function useCreateCardType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CardTypeInput) => api.post<CardType>('/card-types', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardTypeKeys.all }),
  });
}

export function useUpdateCardType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: CardTypeInput & { id: string }) =>
      api.patch<CardType>(`/card-types/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardTypeKeys.all }),
  });
}

export function useDeleteCardType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/card-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardTypeKeys.all }),
  });
}
