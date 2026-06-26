import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Column } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  onDragStart: (cardId: string) => void;
  onDropCard: (columnId: string, position: number) => void;
}

export function KanbanColumn({ column, onDragStart, onDropCard }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDropCard(column.id, column.cards.length);
      }}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors',
        isOver && 'border-primary/50 bg-muted',
      )}
    >
      <header className="flex items-center gap-2 px-3 py-2.5">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: column.color ?? '#94a3b8' }} />
        <h3 className="text-sm font-semibold">{column.name}</h3>
        <span className="ml-auto rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
          {column.cards.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2 p-2 pt-0">
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} onDragStart={onDragStart} />
        ))}
        {column.cards.length === 0 && (
          <p className="px-2 py-8 text-center text-xs text-muted-foreground">
            Arraste cartões para cá
          </p>
        )}
      </div>
    </section>
  );
}
