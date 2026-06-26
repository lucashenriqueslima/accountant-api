import { Building2, KanbanSquare, LayoutDashboard, ListChecks, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { BrandMark } from '@/components/brand/BrandMark';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { roleLabels } from '@/features/users/constants';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof KanbanSquare;
  end: boolean;
  roles?: Role[]; // undefined => todos
}

const navItems: NavItem[] = [
  { to: '/', label: 'Meu board', icon: LayoutDashboard, end: true },
  { to: '/boards', label: 'Boards da equipe', icon: KanbanSquare, end: false, roles: ['ADMIN', 'MANAGER'] },
  { to: '/tarefas', label: 'Tarefas', icon: ListChecks, end: false, roles: ['ADMIN', 'MANAGER'] },
  { to: '/clientes', label: 'Clientes', icon: Building2, end: false, roles: ['ADMIN', 'MANAGER'] },
  { to: '/usuarios', label: 'Usuários', icon: Users, end: false, roles: ['ADMIN'] },
];

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const visibleItems = navItems.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <BrandMark className="size-9" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Forte</p>
            <p className="text-xs text-muted-foreground">Contabilidade</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {visibleItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="border-t p-3">
            <div className="flex items-center gap-2.5 px-1 py-1.5">
              <Avatar className="size-8">
                <AvatarFallback className="text-[10px]">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
              </div>
              <Button variant="ghost" size="icon" title="Sair" onClick={logout}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
