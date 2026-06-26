import { useRef } from 'react';
import type { BoardWithColumns } from '@/types';
import { useMoveCard } from '../api';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  board: BoardWithColumns;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const draggedCardId = useRef<string | null>(null);
  const moveCard = useMoveCard();

  const handleDrop = (columnId: string, position: number) => {
    const cardId = draggedCardId.current;
    if (!cardId) return;
    draggedCardId.current = null;
    moveCard.mutate({ cardId, columnId, position });
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
        />
      ))}
    </div>
  );
}
