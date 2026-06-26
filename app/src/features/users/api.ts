import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toQueryString, type ListParams } from '@/lib/query-string';
import type { Role, User } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  list: (params: ListParams) => ['users', 'list', params] as const,
  detail: (id: string) => ['users', id] as const,
};

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: Role;
  active?: boolean;
}

export function useUsers(params: ListParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => api.get<User[]>(`/users${toQueryString(params)}`),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserInput) => api.post<User>('/users', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<UserInput>) => api.patch<User>(`/users/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
