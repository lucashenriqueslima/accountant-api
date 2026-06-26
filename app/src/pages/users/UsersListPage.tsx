import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, sortableHeader, useTableQuery } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeleteUser, useUsers } from '@/features/users/api';
import { roleLabels, roleStyles } from '@/features/users/constants';
import type { User } from '@/types';

const columnHelper = createColumnHelper<User>();

export function UsersListPage() {
  const { filters, setFilters, params } = useTableQuery();
  const { data: users, isLoading, isFetching } = useUsers(params);
  const deleteUser = useDeleteUser();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir o usuário "${name}"? Ele perderá o acesso ao sistema.`)) {
      deleteUser.mutate(id);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: sortableHeader('Nome'),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: sortableHeader('E-mail'),
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Papel',
        cell: (info) => (
          <Badge className={cn('border-transparent', roleStyles[info.getValue()])}>
            {roleLabels[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (
          <Badge variant={info.getValue() ? 'default' : 'outline'}>
            {info.getValue() ? 'Ativo' : 'Inativo'}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: (info) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" title="Ver">
              <Link to={`/usuarios/${info.row.original.id}`}>
                <Eye className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" title="Editar">
              <Link to={`/usuarios/${info.row.original.id}/editar`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Excluir"
              onClick={() => handleDelete(info.row.original.id, info.row.original.name)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerencie membros e papéis do escritório.</p>
        </div>
        <Button asChild>
          <Link to="/usuarios/novo">
            <Plus className="size-4" />
            Novo usuário
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <DataTable
          columns={columns}
          data={users ?? []}
          filters={filters}
          onFiltersChange={setFilters}
          isLoading={isLoading}
          isFetching={isFetching}
          searchPlaceholder="Buscar usuário..."
          dateLabel="Cadastro"
          emptyMessage="Nenhum usuário encontrado."
        />
      </div>
    </>
  );
}
