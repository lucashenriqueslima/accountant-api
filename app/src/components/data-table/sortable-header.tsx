import type { SortDirection } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Subconjunto da API de coluna do TanStack usado pelo cabeçalho ordenável. */
interface SortableColumn {
  toggleSorting: (desc?: boolean) => void;
  getIsSorted: () => false | SortDirection;
}

/**
 * Cabeçalho de coluna ordenável reutilizável. Use no `header` de uma coluna:
 *
 *   columnHelper.accessor('name', { header: sortableHeader('Cliente'), ... })
 */
export function sortableHeader(label: string) {
  return function SortableHeader({ column }: { column: SortableColumn }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        {label}
        <ArrowUpDown className="ml-1 size-3.5" />
      </Button>
    );
  };
}
