import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { useBoardColumns, useCard, useCreateCard, useUpdateCard, type CardInput } from '@/features/cards/api';
import { useCardTypes } from '@/features/card-types/api';
import { CardTypesManagerDialog } from '@/features/card-types/CardTypesManagerDialog';
import { TitleCombobox } from '@/features/card-types/TitleCombobox';
import { useBoards } from '@/features/boards/api';
import { priorityLabels } from '@/features/boards/constants';
import { useClients } from '@/features/clients/api';
import { useUsers } from '@/features/users/api';
import type { Priority } from '@/types';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function CardFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useCard(id);
  const { data: boards } = useBoards();
  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const { data: cardTypes } = useCardTypes();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard(id ?? '');

  const [boardId, setBoardId] = useState('');
  const { data: columns } = useBoardColumns(boardId);

  const [typesOpen, setTypesOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    columnId: '',
    clientId: '',
    assigneeId: '',
    priority: 'MEDIUM' as Priority,
    dueDate: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Pré-seleciona o primeiro quadro ao criar.
  useEffect(() => {
    if (!isEdit && !boardId && boards?.length) setBoardId(boards[0].id);
  }, [boards, boardId, isEdit]);

  // Preenche o formulário ao editar.
  useEffect(() => {
    if (existing) {
      setBoardId(existing.column?.boardId ?? '');
      setForm({
        title: existing.title,
        description: existing.description ?? '',
        columnId: existing.columnId,
        clientId: existing.clientId ?? '',
        assigneeId: existing.assigneeId ?? '',
        priority: existing.priority,
        dueDate: existing.dueDate ? existing.dueDate.slice(0, 10) : '',
      });
    }
  }, [existing]);

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
      if (isEdit) await updateCard.mutateAsync(payload);
      else await createCard.mutateAsync(payload);
      navigate('/tarefas');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar');
    }
  };

  const pending = createCard.isPending || updateCard.isPending;

  return (
    <>
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-6 sm:py-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/tarefas">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar tarefa' : 'Nova tarefa'}</h1>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <TitleCombobox
              id="title"
              required
              value={form.title}
              onChange={(title) => setForm((f) => ({ ...f, title }))}
              cardTypes={cardTypes ?? []}
              onManage={() => setTypesOpen(true)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="board">Quadro</Label>
              <select
                id="board"
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
              <Label htmlFor="column">Coluna</Label>
              <select
                id="column"
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
              <Label htmlFor="client">Cliente</Label>
              <select
                id="client"
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
              <Label htmlFor="assignee">Responsável</Label>
              <select
                id="assignee"
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
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
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
              <Label htmlFor="dueDate">Prazo</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/tarefas">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>

      <CardTypesManagerDialog open={typesOpen} onOpenChange={setTypesOpen} />
    </>
  );
}
