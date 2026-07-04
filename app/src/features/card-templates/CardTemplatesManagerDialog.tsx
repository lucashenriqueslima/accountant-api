import { Pencil, Play, Plus, Power, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBoards } from '@/features/boards/api';
import { priorityLabels, priorityStyles } from '@/features/boards/constants';
import { useCardTypes } from '@/features/card-types/api';
import { CardTypesManagerDialog } from '@/features/card-types/CardTypesManagerDialog';
import { TitleCombobox } from '@/features/card-types/TitleCombobox';
import { useClients } from '@/features/clients/api';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { CardFrequency, CardTemplate, Priority } from '@/types';
import {
  useCardTemplates,
  useCreateCardTemplate,
  useDeleteCardTemplate,
  useGenerateCards,
  useUpdateCardTemplate,
  type CardTemplateInput,
} from './api';

interface CardTemplatesManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando definido, restringe o modal aos modelos deste cliente. */
  clientId?: string;
  /** Nome do cliente, usado apenas para o título quando há escopo. */
  clientName?: string;
}

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const frequencies: CardFrequency[] = ['MONTHLY', 'YEARLY'];
const frequencyLabels: Record<CardFrequency, string> = {
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

const emptyForm = {
  title: '',
  description: '',
  boardId: '',
  clientId: '',
  priority: 'MEDIUM' as Priority,
  frequency: 'MONTHLY' as CardFrequency,
  active: true,
};

/**
 * Modal para gerenciar os Modelos de Tarefa — tarefas recorrentes que o cron
 * transforma em cartões todo dia às 00:01, na coluna "A fazer" do quadro.
 */
export function CardTemplatesManagerDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
}: CardTemplatesManagerDialogProps) {
  const { data: templates } = useCardTemplates();
  const { data: boards } = useBoards();
  const { data: clients } = useClients();
  const { data: cardTypes } = useCardTypes();

  const createTemplate = useCreateCardTemplate();
  const updateTemplate = useUpdateCardTemplate();
  const deleteTemplate = useDeleteCardTemplate();
  const generateCards = useGenerateCards();

  // Com escopo de cliente, o formulário já nasce vinculado a ele.
  const initialForm = { ...emptyForm, clientId: clientId ?? '' };

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);
  const [typesOpen, setTypesOpen] = useState(false);

  // Quando há escopo, mostra apenas os modelos do cliente em questão.
  const visibleTemplates = clientId
    ? templates?.filter((template) => template.clientId === clientId)
    : templates;

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleError = (err: unknown, fallback: string) =>
    setError(err instanceof ApiError ? err.message : fallback);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title || !form.boardId) return;
    setError(null);

    const input: CardTemplateInput = {
      title,
      boardId: form.boardId,
      priority: form.priority,
      frequency: form.frequency,
      active: form.active,
      description: form.description.trim() || undefined,
      ...(form.clientId ? { clientId: form.clientId } : {}),
    };

    try {
      if (editingId) await updateTemplate.mutateAsync({ id: editingId, ...input });
      else await createTemplate.mutateAsync(input);
      resetForm();
    } catch (err) {
      handleError(err, 'Não foi possível salvar o modelo.');
    }
  };

  const startEdit = (template: CardTemplate) => {
    setEditingId(template.id);
    setError(null);
    setForm({
      title: template.title,
      description: template.description ?? '',
      boardId: template.boardId,
      clientId: template.clientId ?? '',
      priority: template.priority,
      frequency: template.frequency,
      active: template.active,
    });
  };

  const handleToggleActive = async (template: CardTemplate) => {
    setError(null);
    try {
      await updateTemplate.mutateAsync({ id: template.id, active: !template.active });
    } catch (err) {
      handleError(err, 'Não foi possível alterar o modelo.');
    }
  };

  const handleDelete = async (template: CardTemplate) => {
    if (!confirm(`Excluir o modelo "${template.title}"?`)) return;
    setError(null);
    try {
      await deleteTemplate.mutateAsync(template.id);
      if (editingId === template.id) resetForm();
    } catch (err) {
      handleError(err, 'Não foi possível excluir o modelo.');
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setGenerated(null);
    try {
      const result = await generateCards.mutateAsync();
      setGenerated(
        `${result.created} cartão(ões) criado(s) · ${result.skipped} pulado(s) (já existiam no período) ` +
          `· ${result.templates} modelo(s) ativo(s).`,
      );
    } catch (err) {
      handleError(err, 'Não foi possível gerar os cartões.');
    }
  };

  const saving = createTemplate.isPending || updateTemplate.isPending;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            resetForm();
            setError(null);
            setGenerated(null);
          }
          onOpenChange(next);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {clientId ? `Modelos de Tarefa · ${clientName ?? 'cliente'}` : 'Modelos de Tarefa'}
            </DialogTitle>
            <DialogDescription>
              {clientId
                ? 'Modelos vinculados a este cliente. Os cartões são gerados pelo cron todo dia às 00:01, na coluna “A fazer” do quadro.'
                : 'Tarefas recorrentes que o cron gera todo dia às 00:01, na coluna “A fazer” do quadro e sem responsável.'}
            </DialogDescription>
          </DialogHeader>

          {/* Formulário (criar / editar) */}
          <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
            <div className="space-y-1.5">
              <Label htmlFor="template-title">Título</Label>
              <TitleCombobox
                id="template-title"
                required
                value={form.title}
                onChange={(title) => setForm((f) => ({ ...f, title }))}
                cardTypes={cardTypes ?? []}
                onManage={() => setTypesOpen(true)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-description">Descrição</Label>
              <textarea
                id="template-description"
                rows={2}
                value={form.description}
                onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className={cn('grid gap-3', clientId ? 'grid-cols-1' : 'grid-cols-2')}>
              <div className="space-y-1.5">
                <Label htmlFor="template-board">Quadro</Label>
                <select
                  id="template-board"
                  value={form.boardId}
                  onChange={(event) => setForm((f) => ({ ...f, boardId: event.target.value }))}
                  className={selectClass}
                >
                  <option value="">Selecione…</option>
                  {boards?.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              </div>

              {!clientId && (
                <div className="space-y-1.5">
                  <Label htmlFor="template-client">Cliente</Label>
                  <select
                    id="template-client"
                    value={form.clientId}
                    onChange={(event) => setForm((f) => ({ ...f, clientId: event.target.value }))}
                    className={selectClass}
                  >
                    <option value="">Sem cliente</option>
                    {clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.tradeName ?? client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 items-end gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="template-priority">Prioridade</Label>
                <select
                  id="template-priority"
                  value={form.priority}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, priority: event.target.value as Priority }))
                  }
                  className={selectClass}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-frequency">Frequência</Label>
                <select
                  id="template-frequency"
                  value={form.frequency}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, frequency: event.target.value as CardFrequency }))
                  }
                  className={selectClass}
                >
                  {frequencies.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequencyLabels[frequency]}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex h-9 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((f) => ({ ...f, active: event.target.checked }))}
                  className="size-4 rounded border-input"
                />
                Ativo
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={!form.title.trim() || !form.boardId || saving}
              >
                {editingId ? (
                  'Salvar modelo'
                ) : (
                  <>
                    <Plus className="size-4" />
                    Adicionar modelo
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" size="sm" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Lista de modelos */}
          <ul className="max-h-64 space-y-1 overflow-auto">
            {visibleTemplates?.length ? (
              visibleTemplates.map((template) => (
                <li
                  key={template.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-2',
                    !template.active && 'opacity-60',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{template.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {template.board?.name ?? '—'}
                      {template.client ? ` · ${template.client.name}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-normal">
                    {frequencyLabels[template.frequency]}
                  </Badge>
                  <Badge className={cn('border-transparent', priorityStyles[template.priority])}>
                    {priorityLabels[template.priority]}
                  </Badge>
                  {!template.active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={template.active ? 'Desativar' : 'Ativar'}
                    className="size-8 shrink-0 text-muted-foreground"
                    disabled={updateTemplate.isPending}
                    onClick={() => handleToggleActive(template)}
                  >
                    <Power className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Editar"
                    className="size-8 shrink-0 text-muted-foreground"
                    onClick={() => startEdit(template)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Excluir"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={deleteTemplate.isPending}
                    onClick={() => handleDelete(template)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))
            ) : (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                {clientId
                  ? 'Nenhum modelo para este cliente ainda.'
                  : 'Nenhum modelo cadastrado ainda.'}
              </li>
            )}
          </ul>

          {/* Disparo manual da rotina do cron */}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {generated ?? 'Gere os cartões agora, sem esperar as 00:01.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={generateCards.isPending}
            >
              <Play className="size-4" />
              {generateCards.isPending ? 'Gerando…' : 'Gerar agora'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CardTypesManagerDialog open={typesOpen} onOpenChange={setTypesOpen} />
    </>
  );
}
