import { useRef } from 'react';
import type { BoardWithColumns } from '@/types';
import { useCreateCard } from '@/features/cards/api';
import { useMoveCard } from '../api';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  board: BoardWithColumns;
  /// Habilita a criação rápida de tarefas direto nas colunas.
  allowCreate?: boolean;
  /// Responsável atribuído às tarefas criadas (ex.: o próprio usuário no "Meu board").
  defaultAssigneeId?: string;
}

export function KanbanBoard({ board, allowCreate, defaultAssigneeId }: KanbanBoardProps) {
  const draggedCardId = useRef<string | null>(null);
  const moveCard = useMoveCard();
  const createCard = useCreateCard();

  const handleDrop = (columnId: string, position: number) => {
    const cardId = draggedCardId.current;
    if (!cardId) return;
    draggedCardId.current = null;
    moveCard.mutate({ cardId, columnId, position });
  };

  const handleAddCard = (columnId: string, title: string) => {
    const column = board.columns.find((c) => c.id === columnId);
    return createCard.mutateAsync({
      title,
      columnId,
      priority: 'MEDIUM',
      position: column?.cards.length ?? 0,
      ...(defaultAssigneeId ? { assigneeId: defaultAssigneeId } : {}),
    });
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {board.columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          onDragStart={(cardId) => {
            draggedCardId.current = cardId;
          }}
          onDropCard={handleDrop}
          onAddCard={allowCreate ? handleAddCard : undefined}
        />
      ))}
    </div>
  );
}
