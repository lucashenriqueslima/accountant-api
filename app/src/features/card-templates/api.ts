import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CardFrequency, CardTemplate, Priority } from '@/types';

export const cardTemplateKeys = {
  all: ['card-templates'] as const,
};

export interface CardTemplateInput {
  title: string;
  description?: string;
  boardId: string;
  priority?: Priority;
  frequency?: CardFrequency;
  clientId?: string;
  active?: boolean;
}

// Resultado do disparo manual da geração (mesma rotina do cron diário).
export interface GenerateCardsResult {
  created: number;
  skipped: number;
  templates: number;
}

export function useCardTemplates() {
  return useQuery({
    queryKey: cardTemplateKeys.all,
    queryFn: () => api.get<CardTemplate[]>('/card-templates'),
  });
}

export function useCreateCardTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CardTemplateInput) => api.post<CardTemplate>('/card-templates', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.all }),
  });
}

export function useUpdateCardTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CardTemplateInput> & { id: string }) =>
      api.patch<CardTemplate>(`/card-templates/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.all }),
  });
}

export function useDeleteCardTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/card-templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardTemplateKeys.all }),
  });
}

// Dispara a geração de cartões agora (sem esperar o cron das 00:01).
export function useGenerateCards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<GenerateCardsResult>('/card-templates/generate'),
    // Cartões novos podem aparecer nos quadros/tarefas.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}
