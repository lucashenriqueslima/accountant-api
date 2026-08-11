import { useMemo, useRef, useState } from 'react';
import type { BoardWithColumns } from '@/types';
import { CardFormDialog } from '@/features/cards/CardFormDialog';
import { useMoveCard } from '../api';
import { filterColumnsByClients } from '../filters';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  board: BoardWithColumns;
  /// Habilita o botão "Adicionar tarefa" nas colunas, que abre o modal de criação.
  allowCreate?: boolean;
  /// Responsável atribuído às tarefas criadas (ex.: o próprio usuário no "Meu board").
  defaultAssigneeId?: string;
  /// Empresas selecionadas no filtro; vazio (ou ausente) mostra todas.
  clientIds?: string[];
}

export function KanbanBoard({
  board,
  allowCreate,
  defaultAssigneeId,
  clientIds,
}: KanbanBoardProps) {
  const draggedCardId = useRef<string | null>(null);
  const moveCard = useMoveCard();
  // Coluna alvo do modal de criação; null = modal fechado.
  const [addColumnId, setAddColumnId] = useState<string | null>(null);

  // O filtro por empresa é só de exibição: o quadro completo continua sendo a
  // referência para calcular a posição real do cartão ao movê-lo.
  const visibleColumns = useMemo(
    () => filterColumnsByClients(board.columns, clientIds ?? []),
    [board.columns, clientIds],
  );

  const handleDrop = (columnId: string, position: number) => {
    const cardId = draggedCardId.current;
    if (!cardId) return;
    draggedCardId.current = null;

    const targetColumn = board.columns.find((c) => c.id === columnId);
    if (!targetColumn) return;

    // A fenda escolhida é um índice da coluna à vista (possivelmente filtrada);
    // converte para a posição real — o índice do cartão que ficará logo abaixo,
    // ou o fim da coluna completa quando soltou depois do último visível.
    const anchor = visibleColumns.find((c) => c.id === columnId)?.cards[position];
    const targetPosition = anchor
      ? targetColumn.cards.findIndex((card) => card.id === anchor.id)
      : targetColumn.cards.length;

    // Localiza a origem para ajustar o índice ao mover dentro da mesma coluna.
    const sourceColumn = board.columns.find((c) => c.cards.some((card) => card.id === cardId));
    const sourceIndex = sourceColumn?.cards.findIndex((card) => card.id === cardId) ?? -1;
    const sameColumn = sourceColumn?.id === columnId;

    // Ao descer na mesma coluna, remover o cartão da origem desloca os índices
    // seguintes em 1 — descontamos para ele cair exatamente na fenda indicada.
    const target =
      sameColumn && sourceIndex !== -1 && sourceIndex < targetPosition
        ? targetPosition - 1
        : targetPosition;

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
      {visibleColumns.map((column) => (
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
