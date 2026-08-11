import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { useBoards } from '@/features/boards/api';
import { priorityLabels } from '@/features/boards/constants';
import { useCardTypes } from '@/features/card-types/api';
import { CardTypesManagerDialog } from '@/features/card-types/CardTypesManagerDialog';
import { TitleCombobox } from '@/features/card-types/TitleCombobox';
import { useClients } from '@/features/clients/api';
import { useUsers } from '@/features/users/api';
import type { Priority } from '@/types';
import { useBoardColumns, useCreateCard, type CardInput } from './api';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const emptyForm = {
  title: '',
  description: '',
  columnId: '',
  clientId: '',
  assigneeId: '',
  priority: 'MEDIUM' as Priority,
  dueDate: '',
};

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /// Quadro pré-selecionado (o quadro atual do kanban).
  boardId: string;
  /// Coluna onde o usuário clicou em "Adicionar tarefa".
  columnId: string;
  /// Responsável padrão (ex.: o próprio usuário no "Meu board").
  defaultAssigneeId?: string;
}

/** Modal de criação de tarefa com todos os campos do formulário completo. */
export function CardFormDialog({
  open,
  onOpenChange,
  boardId: initialBoardId,
  columnId,
  defaultAssigneeId,
}: CardFormDialogProps) {
  const { data: boards } = useBoards();
  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const { data: cardTypes } = useCardTypes();
  const createCard = useCreateCard();

  const [boardId, setBoardId] = useState(initialBoardId);
  const { data: columns } = useBoardColumns(boardId);

  const [typesOpen, setTypesOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);

  // Ao abrir, posiciona o formulário na coluna/quadro clicados e limpa o restante.
  useEffect(() => {
    if (!open) return;
    setBoardId(initialBoardId);
    setForm({ ...emptyForm, columnId, assigneeId: defaultAssigneeId ?? '' });
    setError(null);
  }, [open, initialBoardId, columnId, defaultAssigneeId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: CardInput = {
      title: form.title,
      description: form.description || undefined,
      columnId: form.columnId,
      priority: form.priority,
      ...(form.clientId ? { clientId: form.clientId } : {}),
      ...(form.assigneeId ? { assigneeId: form.assigneeId } : {}),
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
    };

    try {
      await createCard.mutateAsync(payload);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="card-title">Título</Label>
              <TitleCombobox
                id="card-title"
                required
                value={form.title}
                onChange={(title) => setForm((f) => ({ ...f, title }))}
                cardTypes={cardTypes ?? []}
                onManage={() => setTypesOpen(true)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="card-description">Descrição</Label>
              <textarea
                id="card-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="card-board">Quadro</Label>
                <select
                  id="card-board"
                  value={boardId}
                  onChange={(e) => {
                    setBoardId(e.target.value);
                    setForm((f) => ({ ...f, columnId: '' }));
                  }}
                  className={selectClass}
                >
                  <option value="">Selecione…</option>
                  {boards?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="card-column">Coluna</Label>
                <select
                  id="card-column"
                  required
                  value={form.columnId}
                  onChange={(e) => setForm((f) => ({ ...f, columnId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Selecione…</option>
                  {columns?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="card-client">Cliente</Label>
                <select
                  id="card-client"
                  value={form.clientId}
                  onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Sem cliente</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName ?? c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="card-assignee">Responsável</Label>
                <select
                  id="card-assignee"
                  value={form.assigneeId}
                  onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Sem responsável</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="card-priority">Prioridade</Label>
                <select
                  id="card-priority"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                  className={selectClass}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {priorityLabels[p]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="card-dueDate">Prazo</Label>
                <Input
                  id="card-dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCard.isPending}>
                {createCard.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CardTypesManagerDialog open={typesOpen} onOpenChange={setTypesOpen} />
    </>
  );
}
