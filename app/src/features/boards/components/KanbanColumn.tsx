import { Plus, X } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Column } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  onDragStart: (cardId: string) => void;
  onDropCard: (columnId: string, position: number) => void;
  /// Quando presente, habilita a criação rápida de tarefas na coluna.
  onAddCard?: (columnId: string, title: string) => Promise<unknown>;
}

export function KanbanColumn({ column, onDragStart, onDropCard, onAddCard }: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    const value = title.trim();
    if (!value || !onAddCard) return;
    setSubmitting(true);
    try {
      await onAddCard(column.id, value);
      setTitle('');
      inputRef.current?.focus(); // mantém aberto para adicionar várias
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    } else if (e.key === 'Escape') {
      setAdding(false);
      setTitle('');
    }
  };

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
        {column.cards.length === 0 && !adding && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {onAddCard ? 'Sem tarefas' : 'Arraste cartões para cá'}
          </p>
        )}

        {/* Criação rápida */}
        {onAddCard &&
          (adding ? (
            <div className="rounded-lg border bg-card p-2 shadow-sm">
              <textarea
                ref={inputRef}
                autoFocus
                rows={2}
                value={title}
                placeholder="Título da tarefa…"
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="mt-1.5 flex items-center gap-1.5">
                <Button size="sm" onClick={() => void submit()} disabled={!title.trim() || submitting}>
                  {submitting ? 'Adicionando…' : 'Adicionar'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title="Fechar"
                  onClick={() => {
                    setAdding(false);
                    setTitle('');
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-4" />
              Adicionar tarefa
            </button>
          ))}
      </div>
    </section>
  );
}
