import { useEffect, useState } from 'react';
import { useMyBoards } from '@/features/boards/api';
import { KanbanBoard } from '@/features/boards/components/KanbanBoard';
import { departmentLabels } from '@/features/boards/constants';
import { cn } from '@/lib/utils';

/// "Meu board" — quadros com os cartões atribuídos ao usuário atual.
/// Disponível a todos os papéis; o colaborador só move as próprias tarefas.
export function MyBoardPage() {
  const { data: boards, isLoading } = useMyBoards();
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    if (!selectedId && boards?.length) setSelectedId(boards[0].id);
  }, [boards, selectedId]);

  const board = boards?.find((b) => b.id === selectedId) ?? boards?.[0];

  return (
    <>
      <header className="border-b px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="text-lg font-semibold">Meu board</h1>
        <p className="text-sm text-muted-foreground">
          As tarefas atribuídas a você. Arraste os cartões conforme for executando.
        </p>

        {boards && boards.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {boards.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  b.id === board?.id
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

      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : board ? (
          <KanbanBoard board={board} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Você não tem tarefas atribuídas no momento.
          </p>
        )}
      </div>
    </>
  );
}
