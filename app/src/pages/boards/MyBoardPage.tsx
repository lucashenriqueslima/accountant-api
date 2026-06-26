import { useEffect, useState } from 'react';
import { KanbanBoard } from '@/features/boards/components/KanbanBoard';
import { useMyBoards } from '@/features/boards/api';
import { departmentLabels } from '@/features/boards/constants';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

export function MyBoardPage() {
  const { user, hasRole } = useAuth();
  const { data: boards, isLoading } = useMyBoards();
  const [selectedId, setSelectedId] = useState<string>();

  // Admin/gestor podem criar tarefas direto no próprio board (atribuídas a si).
  const canCreate = hasRole('ADMIN', 'MANAGER');

  useEffect(() => {
    if (!selectedId && boards?.length) setSelectedId(boards[0].id);
  }, [boards, selectedId]);

  const board = boards?.find((b) => b.id === selectedId);

  return (
    <>
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Meu board</h1>
        <p className="text-sm text-muted-foreground">
          Suas tarefas, {user?.name}. Arraste os cartões conforme avança.
        </p>

        {boards && boards.length > 1 && (
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
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : board ? (
          <KanbanBoard board={board} allowCreate={canCreate} defaultAssigneeId={user?.id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Você ainda não tem tarefas atribuídas.
          </p>
        )}
      </div>
    </>
  );
}
