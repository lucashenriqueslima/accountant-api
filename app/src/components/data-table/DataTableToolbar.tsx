import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TableFilters } from './useTableQuery';

interface DataTableToolbarProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  /** Placeholder do campo de busca. */
  searchPlaceholder?: string;
  /** Rótulo do filtro de período (ex.: "Prazo", "Cadastro"). */
  dateLabel?: string;
  /** Oculta o filtro de datas quando a tabela não tem uma data relevante. */
  showDateFilter?: boolean;
}

const dateInputClass =
  'h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

/** Barra de filtros reutilizável: busca textual + intervalo de datas. */
export function DataTableToolbar({
  filters,
  onFiltersChange,
  searchPlaceholder = 'Buscar...',
  dateLabel = 'Período',
  showDateFilter = true,
}: DataTableToolbarProps) {
  const patch = (partial: Partial<TableFilters>) => onFiltersChange({ ...filters, ...partial });

  const hasFilters = Boolean(filters.search || filters.dateFrom || filters.dateTo);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => patch({ search: e.target.value })}
          placeholder={searchPlaceholder}
          className="pl-8"
        />
      </div>

      {showDateFilter && (
        <div className="flex w-full items-end gap-2 sm:w-auto">
          <div className="flex flex-1 flex-col gap-1 sm:flex-none">
            <label className="text-xs text-muted-foreground">{dateLabel} — de</label>
            <input
              type="date"
              value={filters.dateFrom}
              max={filters.dateTo || undefined}
              onChange={(e) => patch({ dateFrom: e.target.value })}
              className={cn(dateInputClass, 'w-full min-w-0 sm:w-auto')}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1 sm:flex-none">
            <label className="text-xs text-muted-foreground">até</label>
            <input
              type="date"
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              onChange={(e) => patch({ dateTo: e.target.value })}
              className={cn(dateInputClass, 'w-full min-w-0 sm:w-auto')}
            />
          </div>
        </div>
      )}

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onFiltersChange({ search: '', dateFrom: '', dateTo: '' })}
        >
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
