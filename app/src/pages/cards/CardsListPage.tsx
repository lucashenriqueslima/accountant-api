import { createColumnHelper } from '@tanstack/react-table';
import { Eye, LayoutTemplate, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, sortableHeader, useTableQuery } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { useCards, useDeleteCard } from '@/features/cards/api';
import { CardTemplatesManagerDialog } from '@/features/card-templates/CardTemplatesManagerDialog';
import { priorityLabels, priorityStyles } from '@/features/boards/constants';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
}

const columnHelper = createColumnHelper<Card>();

export function CardsListPage() {
  const { hasRole } = useAuth();
  const { filters, setFilters, params } = useTableQuery();
  const { data: cards, isLoading, isFetching } = useCards(params);
  const deleteCard = useDeleteCard();
  const isAdmin = hasRole('ADMIN');
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Excluir a tarefa "${title}"?`)) deleteCard.mutate(id);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: sortableHeader('Tarefa'),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'client',
        header: 'Cliente',
        meta: { className: 'hidden md:table-cell' },
        cell: (info) => (
          <span className="text-muted-foreground">
            {info.row.original.client?.tradeName ?? info.row.original.client?.name ?? '—'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'assignee',
        header: 'Responsável',
        meta: { className: 'hidden lg:table-cell' },
        cell: (info) => (
          <span className="text-muted-foreground">{info.row.original.assignee?.name ?? '—'}</span>
        ),
      }),
      columnHelper.display({
        id: 'status',
        header: 'Status',
        meta: { className: 'hidden sm:table-cell' },
        cell: (info) => (
          <span className="text-muted-foreground">{info.row.original.column?.name ?? '—'}</span>
        ),
      }),
      columnHelper.accessor('priority', {
        header: sortableHeader('Prioridade'),
        meta: { className: 'hidden sm:table-cell' },
        cell: (info) => (
          <Badge className={cn('border-transparent', priorityStyles[info.getValue()])}>
            {priorityLabels[info.getValue()]}
          </Badge>
        ),
      }),
      columnHelper.accessor('dueDate', {
        header: sortableHeader('Prazo'),
        cell: (info) => <span className="text-muted-foreground">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: (info) => (
          <div className="flex justify-end gap-1">
            <Button asChild variant="ghost" size="icon" title="Ver">
              <Link to={`/tarefas/${info.row.original.id}`}>
                <Eye className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" title="Editar">
              <Link to={`/tarefas/${info.row.original.id}/editar`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                title="Excluir"
                onClick={() => handleDelete(info.row.original.id, info.row.original.title)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin],
  );

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4">
        <div>
          <h1 className="text-lg font-semibold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Obrigações e demandas do escritório.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setTemplatesOpen(true)}>
            <LayoutTemplate className="size-4" />
            Modelos
          </Button>
          <Button asChild>
            <Link to="/tarefas/nova">
              <Plus className="size-4" />
              Nova tarefa
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <DataTable
          columns={columns}
          data={cards ?? []}
          filters={filters}
          onFiltersChange={setFilters}
          isLoading={isLoading}
          isFetching={isFetching}
          searchPlaceholder="Buscar tarefa..."
          dateLabel="Prazo"
          emptyMessage="Nenhuma tarefa encontrada."
        />
      </div>

      <CardTemplatesManagerDialog open={templatesOpen} onOpenChange={setTemplatesOpen} />
    </>
  );
}
