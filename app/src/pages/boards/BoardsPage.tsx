import { useEffect, useState } from 'react';
import { KanbanBoard } from '@/features/boards/components/KanbanBoard';
import { useBoard, useBoards } from '@/features/boards/api';
import { departmentLabels } from '@/features/boards/constants';
import { useUsers } from '@/features/users/api';
import { cn } from '@/lib/utils';

export function BoardsPage() {
  const { data: boards, isLoading: loadingBoards } = useBoards();
  const { data: users } = useUsers();
  const [selectedId, setSelectedId] = useState<string>();
  const [assigneeId, setAssigneeId] = useState<string>('');

  useEffect(() => {
    if (!selectedId && boards?.length) setSelectedId(boards[0].id);
  }, [boards, selectedId]);

  const { data: board, isLoading: loadingBoard } = useBoard(selectedId, assigneeId || undefined);

  return (
    <>
      <header className="border-b px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Boards da equipe</h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe e direcione as obrigações de cada departamento.
            </p>
          </div>

          {/* Filtro por responsável — ver o board de um colaborador específico */}
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Todos os responsáveis</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {boards && boards.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  b.id === selectedId
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-accent',
                )}
              >
                {b.name}
                <span className="ml-1.5 text-xs opacity-70">{departmentLabels[b.department]}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-hidden p-6">
        {loadingBoards || loadingBoard ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : board ? (
          <KanbanBoard board={board} />
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum quadro disponível.</p>
        )}
      </div>
    </>
  );
}
