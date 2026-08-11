import { Plus } from 'lucide-react';
import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Column } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  /// Colunas do quadro, para o seletor "mover para" dos cartões (mobile).
  moveTargets: { id: string; name: string }[];
  onMoveCard: (cardId: string, columnId: string) => void;
  onDragStart: (cardId: string) => void;
  onDropCard: (columnId: string, position: number) => void;
  /// Quando presente, habilita a criação de tarefas: abre o modal para esta coluna.
  onAddCard?: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  moveTargets,
  onMoveCard,
  onDragStart,
  onDropCard,
  onAddCard,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  // Índice da "fenda" onde o cartão será solto (0 = antes do 1º, length = no fim).
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        // Sobre a área vazia da coluna: solta no fim.
        setDragOverIndex(column.cards.length);
      }}
      onDragLeave={(e) => {
        // Ignora quando ainda está dentro da coluna (evita piscar entre cartões).
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setIsOver(false);
        setDragOverIndex(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const target = dragOverIndex ?? column.cards.length;
        setIsOver(false);
        setDragOverIndex(null);
        onDropCard(column.id, target);
      }}
      className={cn(
        'flex max-h-full w-72 shrink-0 snap-center flex-col rounded-xl border bg-muted/40 transition-colors md:snap-align-none',
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

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0">
        {column.cards.map((card, index) => (
          <Fragment key={card.id}>
            {dragOverIndex === index && <DropIndicator />}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Metade de cima do cartão = soltar antes; metade de baixo = depois.
                const rect = e.currentTarget.getBoundingClientRect();
                const after = e.clientY > rect.top + rect.height / 2;
                setIsOver(true);
                setDragOverIndex(index + (after ? 1 : 0));
              }}
            >
              <KanbanCard
                card={card}
                currentColumnId={column.id}
                moveTargets={moveTargets}
                onMove={onMoveCard}
                onDragStart={onDragStart}
              />
            </div>
          </Fragment>
        ))}
        {dragOverIndex === column.cards.length && <DropIndicator />}
        {column.cards.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {onAddCard ? 'Sem tarefas' : 'Arraste cartões para cá'}
          </p>
        )}

        {onAddCard && (
          <button
            type="button"
            onClick={() => onAddCard(column.id)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-4" />
            Adicionar tarefa
          </button>
        )}
      </div>
    </section>
  );
}

/// Linha que indica onde o cartão arrastado será solto.
function DropIndicator() {
  return <div className="h-1 rounded-full bg-primary" aria-hidden />;
}
