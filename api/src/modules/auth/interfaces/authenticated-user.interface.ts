import { Role } from '@prisma/client';

/// Usuário autenticado anexado a `request.user` após o JwtStrategy.
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
