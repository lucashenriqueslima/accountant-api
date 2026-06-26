import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import {
  useCardTypes,
  useCreateCardType,
  useDeleteCardType,
  useUpdateCardType,
} from './api';

interface CardTypesManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal para criar, editar e excluir os títulos pré-salvos (tipos de tarefa). */
export function CardTypesManagerDialog({ open, onOpenChange }: CardTypesManagerDialogProps) {
  const { data: cardTypes } = useCardTypes();
  const createCardType = useCreateCardType();
  const updateCardType = useUpdateCardType();
  const deleteCardType = useDeleteCardType();

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleError = (err: unknown, fallback: string) =>
    setError(err instanceof ApiError ? err.message : fallback);

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setError(null);
    try {
      await createCardType.mutateAsync({ title });
      setNewTitle('');
    } catch (err) {
      handleError(err, 'Não foi possível criar o tipo.');
    }
  };

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
    setError(null);
  };

  const handleUpdate = async () => {
    const title = editingTitle.trim();
    if (!title || !editingId) return;
    setError(null);
    try {
      await updateCardType.mutateAsync({ id: editingId, title });
      resetEditing();
    } catch (err) {
      handleError(err, 'Não foi possível salvar o tipo.');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteCardType.mutateAsync(id);
      if (editingId === id) resetEditing();
    } catch (err) {
      handleError(err, 'Não foi possível excluir o tipo.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tipos de tarefa</DialogTitle>
          <DialogDescription>
            Títulos pré-salvos que aparecem como sugestão ao criar uma tarefa.
          </DialogDescription>
        </DialogHeader>

        {/* Criar novo */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Novo tipo de tarefa…"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Adicionar tipo"
            disabled={!newTitle.trim() || createCardType.isPending}
          >
            <Plus className="size-4" />
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Lista */}
        <ul className="max-h-72 space-y-1 overflow-auto">
          {cardTypes?.length ? (
            cardTypes.map((type) => (
              <li
                key={type.id}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5"
              >
                {editingId === type.id ? (
                  <>
                    <Input
                      autoFocus
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleUpdate();
                        }
                        if (event.key === 'Escape') resetEditing();
                      }}
                      className="h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Salvar"
                      className="size-8 shrink-0"
                      disabled={!editingTitle.trim() || updateCardType.isPending}
                      onClick={handleUpdate}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Cancelar"
                      className="size-8 shrink-0 text-muted-foreground"
                      onClick={resetEditing}
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 truncate text-sm">{type.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      className="size-8 shrink-0 text-muted-foreground"
                      onClick={() => startEdit(type.id, type.title)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={deleteCardType.isPending}
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </li>
            ))
          ) : (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nenhum tipo cadastrado ainda.
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
