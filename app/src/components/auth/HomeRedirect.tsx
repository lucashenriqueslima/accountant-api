import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

/// Página inicial: cada papel cai na primeira tela que consegue ver.
/// Também é o destino do `RequireRole` quando o acesso é negado.
export function HomeRedirect() {
  const { hasRole } = useAuth();
  return <Navigate to={hasRole('ADMIN', 'MANAGER') ? '/boards' : '/meu-board'} replace />;
}
