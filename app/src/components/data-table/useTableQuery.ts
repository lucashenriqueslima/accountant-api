import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ListParams } from '@/lib/query-string';

export interface TableFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
}

const emptyFilters: TableFilters = { search: '', dateFrom: '', dateTo: '' };

/**
 * Estado dos filtros de uma tabela (busca + período) com debounce embutido.
 *
 * - `filters`/`setFilters`: estado bruto, ligado à toolbar do `DataTable`.
 * - `params`: pronto para enviar ao backend (busca já com debounce, vazios omitidos).
 */
export function useTableQuery() {
  const [filters, setFilters] = useState<TableFilters>(emptyFilters);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const params = useMemo<ListParams>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    [debouncedSearch, filters.dateFrom, filters.dateTo],
  );

  return { filters, setFilters, params };
}
