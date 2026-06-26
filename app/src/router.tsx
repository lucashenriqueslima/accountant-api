import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RequireRole';
import { AppLayout } from '@/components/layout/AppLayout';
import { ClientsPage } from '@/pages/ClientsPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { BoardsPage } from '@/pages/boards/BoardsPage';
import { MyBoardPage } from '@/pages/boards/MyBoardPage';
import { CardFormPage } from '@/pages/cards/CardFormPage';
import { CardShowPage } from '@/pages/cards/CardShowPage';
import { CardsListPage } from '@/pages/cards/CardsListPage';
import { ClientFormPage } from '@/pages/clients/ClientFormPage';
import { ClientShowPage } from '@/pages/clients/ClientShowPage';
import { UserFormPage } from '@/pages/users/UserFormPage';
import { UserShowPage } from '@/pages/users/UserShowPage';
import { UsersListPage } from '@/pages/users/UsersListPage';
import type { Role } from '@/types';
import type { ReactNode } from 'react';

const managers: Role[] = ['ADMIN', 'MANAGER'];

function gate(roles: Role[], element: ReactNode) {
  return <RequireRole roles={roles}>{element}</RequireRole>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <MyBoardPage /> },
          { path: 'boards', element: gate(managers, <BoardsPage />) },

          // Tarefas (cards)
          { path: 'tarefas', element: gate(managers, <CardsListPage />) },
          { path: 'tarefas/nova', element: gate(managers, <CardFormPage />) },
          { path: 'tarefas/:id', element: gate(managers, <CardShowPage />) },
          { path: 'tarefas/:id/editar', element: gate(managers, <CardFormPage />) },

          // Clientes
          { path: 'clientes', element: gate(managers, <ClientsPage />) },
          { path: 'clientes/novo', element: gate(managers, <ClientFormPage />) },
          { path: 'clientes/:id', element: gate(managers, <ClientShowPage />) },
          { path: 'clientes/:id/editar', element: gate(managers, <ClientFormPage />) },

          // Usuários (somente admin)
          { path: 'usuarios', element: gate(['ADMIN'], <UsersListPage />) },
          { path: 'usuarios/novo', element: gate(['ADMIN'], <UserFormPage />) },
          { path: 'usuarios/:id', element: gate(managers, <UserShowPage />) },
          { path: 'usuarios/:id/editar', element: gate(['ADMIN'], <UserFormPage />) },
        ],
      },
    ],
  },
]);
