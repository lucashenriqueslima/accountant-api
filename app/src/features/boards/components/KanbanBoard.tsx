import { useRef, useState } from 'react';
import type { BoardWithColumns } from '@/types';
import { CardFormDialog } from '@/features/cards/CardFormDialog';
import { useMoveCard } from '../api';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  board: BoardWithColumns;
  /// Habilita o botão "Adicionar tarefa" nas colunas, que abre o modal de criação.
  allowCreate?: boolean;
  /// Responsável atribuído às tarefas criadas (ex.: o próprio usuário no "Meu board").
  defaultAssigneeId?: string;
}

export function KanbanBoard({ board, allowCreate, defaultAssigneeId }: KanbanBoardProps) {
  const draggedCardId = useRef<string | null>(null);
  const moveCard = useMoveCard();
  // Coluna alvo do modal de criação; null = modal fechado.
  const [addColumnId, setAddColumnId] = useState<string | null>(null);

  const handleDrop = (columnId: string, position: number) => {
    const cardId = draggedCardId.current;
    if (!cardId) return;
    draggedCardId.current = null;

    // Localiza a origem para ajustar o índice ao mover dentro da mesma coluna.
    const sourceColumn = board.columns.find((c) => c.cards.some((card) => card.id === cardId));
    const sourceIndex = sourceColumn?.cards.findIndex((card) => card.id === cardId) ?? -1;
    const sameColumn = sourceColumn?.id === columnId;

    // Ao descer na mesma coluna, remover o cartão da origem desloca os índices
    // seguintes em 1 — descontamos para ele cair exatamente na fenda indicada.
    const target = sameColumn && sourceIndex !== -1 && sourceIndex < position ? position - 1 : position;

    // Soltou no mesmo lugar: nada a fazer.
    if (sameColumn && target === sourceIndex) return;

    moveCard.mutate({ cardId, columnId, position: target });
  };

  // Alternativa ao drag-and-drop (que não existe em telas touch): o cartão
  // oferece um seletor "mover para" e cai no fim da coluna escolhida.
  const moveTargets = board.columns.map((c) => ({ id: c.id, name: c.name }));
  const handleMoveToColumn = (cardId: string, columnId: string) => {
    const target = board.columns.find((c) => c.id === columnId);
    if (!target) return;
    moveCard.mutate({ cardId, columnId, position: target.cards.length });
  };

  return (
    <div className="flex h-full snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-4 md:snap-none">
      {board.columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          moveTargets={moveTargets}
          onMoveCard={handleMoveToColumn}
          onDragStart={(cardId) => {
            draggedCardId.current = cardId;
          }}
          onDropCard={handleDrop}
          onAddCard={allowCreate ? (columnId) => setAddColumnId(columnId) : undefined}
        />
      ))}

      {allowCreate && (
        <CardFormDialog
          open={addColumnId !== null}
          onOpenChange={(open) => {
            if (!open) setAddColumnId(null);
          }}
          boardId={board.id}
          columnId={addColumnId ?? ''}
          defaultAssigneeId={defaultAssigneeId}
        />
      )}
    </div>
  );
}
