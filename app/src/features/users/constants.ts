import type { Role } from '@/types';

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gestor',
  EMPLOYEE: 'Colaborador',
};

export const roleStyles: Record<Role, string> = {
  ADMIN: 'bg-amber-100 text-amber-800',
  MANAGER: 'bg-blue-100 text-blue-800',
  EMPLOYEE: 'bg-slate-100 text-slate-700',
};

export const roleOptions: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: roleLabels.ADMIN },
  { value: 'MANAGER', label: roleLabels.MANAGER },
  { value: 'EMPLOYEE', label: roleLabels.EMPLOYEE },
];
