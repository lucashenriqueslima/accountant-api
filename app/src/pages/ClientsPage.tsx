import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Pencil, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable, sortableHeader, useTableQuery } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClients } from '@/features/clients/api';
import { taxRegimeLabels } from '@/features/boards/constants';
import type { Client } from '@/types';

const columnHelper = createColumnHelper<Client>();

const columns = [
  columnHelper.accessor('name', {
    header: sortableHeader('Cliente'),
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        {info.row.original.tradeName && (
          <p className="text-xs text-muted-foreground">{info.row.original.tradeName}</p>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('document', {
    header: 'CNPJ / CPF',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor('taxRegime', {
    header: 'Regime',
    cell: (info) => <Badge variant="secondary">{taxRegimeLabels[info.getValue()]}</Badge>,
  }),
  columnHelper.accessor('email', {
    header: 'E-mail',
    cell: (info) => info.getValue() ?? '—',
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
          <Link to={`/clientes/${info.row.original.id}`}>
            <Eye className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" title="Editar">
          <Link to={`/clientes/${info.row.original.id}/editar`}>
            <Pencil className="size-4" />
          </Link>
        </Button>
      </div>
    ),
  }),
];

export function ClientsPage() {
  const { filters, setFilters, params } = useTableQuery();
  const { data: clients, isLoading, isFetching, isError, error } = useClients(params);

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Empresas e pessoas atendidas pelo escritório.
          </p>
        </div>
        <Button asChild>
          <Link to="/clientes/novo">
            <Plus className="size-4" />
            Novo cliente
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isError ? (
          <p className="text-sm text-destructive">Erro ao carregar: {(error as Error).message}</p>
        ) : (
          <DataTable
            columns={columns}
            data={clients ?? []}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
            isFetching={isFetching}
            searchPlaceholder="Buscar cliente..."
            dateLabel="Cadastro"
            emptyMessage="Nenhum cliente encontrado."
          />
        )}
      </div>
    </>
  );
}
