import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth-storage';
import type { CardAttachment, CardComment, CardEmail } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const cardThreadKeys = {
  comments: (cardId: string) => ['cards', cardId, 'comments'] as const,
  attachments: (cardId: string) => ['cards', cardId, 'attachments'] as const,
  emails: (cardId: string) => ['cards', cardId, 'emails'] as const,
};

/// POST com multipart/form-data (uploads), reaproveitando o token de auth.
async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(message ?? 'Falha ao enviar');
  }
  return res.json() as Promise<T>;
}

// ─── Comentários ───────────────────────────────────────────────────────

export function useCardComments(cardId: string, enabled = true) {
  return useQuery({
    queryKey: cardThreadKeys.comments(cardId),
    queryFn: () => api.get<CardComment[]>(`/cards/${cardId}/comments`),
    enabled: enabled && Boolean(cardId),
  });
}

export function useCreateCardComment(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, files }: { body: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('body', body);
      files.forEach((file) => formData.append('files', file));
      return postFormData<CardComment>(`/cards/${cardId}/comments`, formData);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardThreadKeys.comments(cardId) }),
  });
}

export function useDeleteCardComment(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.delete<void>(`/cards/${cardId}/comments/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardThreadKeys.comments(cardId) }),
  });
}

// ─── Anexos da tarefa ────────────────────────────────────────────────────

export function useCardAttachments(cardId: string, enabled = true) {
  return useQuery({
    queryKey: cardThreadKeys.attachments(cardId),
    queryFn: () => api.get<CardAttachment[]>(`/cards/${cardId}/attachments`),
    enabled: enabled && Boolean(cardId),
  });
}

export function useUploadCardAttachment(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return postFormData<CardAttachment>(`/cards/${cardId}/attachments`, formData);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: cardThreadKeys.attachments(cardId) }),
  });
}

export function useDeleteCardAttachment(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      api.delete<void>(`/cards/${cardId}/attachments/${attachmentId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: cardThreadKeys.attachments(cardId) }),
  });
}

// ─── E-mails ──────────────────────────────────────────────────────────────

export interface SendCardEmailInput {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachmentIds?: string[];
}

export function useCardEmails(cardId: string, enabled = true) {
  return useQuery({
    queryKey: cardThreadKeys.emails(cardId),
    queryFn: () => api.get<CardEmail[]>(`/cards/${cardId}/emails`),
    enabled: enabled && Boolean(cardId),
  });
}

export function useSendCardEmail(cardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendCardEmailInput) =>
      api.post<CardEmail>(`/cards/${cardId}/emails`, input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: cardThreadKeys.emails(cardId) }),
  });
}
