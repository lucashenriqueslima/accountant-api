import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import type { Role } from '@/types';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

/// Restringe o conteúdo aos papéis informados; senão redireciona para a home.
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
