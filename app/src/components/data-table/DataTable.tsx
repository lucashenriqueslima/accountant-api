import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Classes aplicadas ao th/td da coluna (ex.: 'hidden md:table-cell'). */
    className?: string;
  }
}
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTableToolbar } from './DataTableToolbar';
import type { TableFilters } from './useTableQuery';

interface DataTableProps<TData> {
  // `any` no TValue: as colunas misturam tipos de valor (string, boolean, enum…)
  // e o TanStack não infere um TValue único para o array. É o padrão da lib.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** Estado dos filtros (use `useTableQuery`). */
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  /** Primeiro carregamento (sem dados ainda). */
  isLoading?: boolean;
  /** Recarregando após mudar um filtro (mantém os dados anteriores na tela). */
  isFetching?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  dateLabel?: string;
  showDateFilter?: boolean;
}

/**
 * Tabela reutilizável de todo o projeto: toolbar com busca textual + filtro de
 * período (server-side) e ordenação client-side. Basta passar `columns` e `data`.
 * Colunas podem definir `meta: { className: 'hidden md:table-cell' }` para
 * sumir em telas estreitas; o restante rola horizontalmente se precisar.
 */
export function DataTable<TData>({
  columns,
  data,
  filters,
  onFiltersChange,
  isLoading = false,
  isFetching = false,
  emptyMessage = 'Nenhum registro encontrado.',
  searchPlaceholder,
  dateLabel,
  showDateFilter,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      <DataTableToolbar
        filters={filters}
        onFiltersChange={onFiltersChange}
        searchPlaceholder={searchPlaceholder}
        dateLabel={dateLabel}
        showDateFilter={showDateFilter}
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-2.5 text-left font-medium',
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={cn('transition-opacity', isFetching && 'opacity-60')}>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Carregando…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn('px-4 py-3', cell.column.columnDef.meta?.className)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
