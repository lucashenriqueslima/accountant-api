import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth-storage';
import type { Client, ClientDocument, ClientWithDocuments, TaxRegime } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const clientKeys = {
  all: ['clients'] as const,
  detail: (id: string) => ['clients', id] as const,
};

export interface ClientInput {
  name: string;
  tradeName?: string;
  document: string;
  taxRegime: TaxRegime;
  email?: string;
  phone?: string;
  active?: boolean;
}

export function useClients() {
  return useQuery({ queryKey: clientKeys.all, queryFn: () => api.get<Client[]>('/clients') });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: clientKeys.detail(id ?? ''),
    queryFn: () => api.get<ClientWithDocuments>(`/clients/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => api.post<Client>('/clients', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ClientInput>) => api.patch<Client>(`/clients/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
    },
  });
}

// ─── Documentos ────────────────────────────────────────────────────────

export function useUploadDocument(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = getToken();
      const res = await fetch(`${BASE_URL}/clients/${clientId}/documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Falha ao enviar o arquivo');
      }
      return res.json() as Promise<ClientDocument>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) }),
  });
}

export function useDeleteDocument(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      api.delete<void>(`/clients/${clientId}/documents/${documentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) }),
  });
}
