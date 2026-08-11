import {
  Building2,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  { to: '/meu-board', label: 'Meu board', icon: LayoutDashboard, end: false },
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

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="size-9" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">Forte</p>
        <p className="text-xs text-muted-foreground">Contabilidade</p>
      </div>
    </div>
  );
}

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const visibleItems = navItems.filter((item) => !item.roles || hasRole(...item.roles));
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Fecha o menu mobile ao navegar para outra rota.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
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
  );

  const userFooter = user && (
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
  );

  return (
    <div className="flex h-dvh flex-col bg-background md:flex-row">
      {/* Barra superior (somente mobile) */}
      <header className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-2.5 md:hidden">
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      </header>

      {/* Drawer de navegação (somente mobile) */}
      {menuOpen && (
        // h-dvh (e não só inset-0): no mobile a barra de URL faz o viewport do
        // `fixed` ficar maior que a área visível, jogando o rodapé do drawer
        // para fora da tela.
        <div className="fixed inset-0 z-50 h-dvh md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85dvw] flex-col border-r bg-card shadow-xl">
            <div className="flex items-center justify-between py-3 pl-5 pr-2">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
            {userFooter}
          </aside>
        </div>
      )}

      {/* Sidebar fixa (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        {nav}
        {userFooter}
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
