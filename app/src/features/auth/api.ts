import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface MessageResponse {
  message: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<MessageResponse>('/auth/forgot-password', { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; password: string }) =>
      api.post<MessageResponse>('/auth/reset-password', input),
  });
}
