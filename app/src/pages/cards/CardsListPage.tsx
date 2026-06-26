import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { useCards, useDeleteCard } from '@/features/cards/api';
import { priorityLabels, priorityStyles } from '@/features/boards/constants';
import { cn } from '@/lib/utils';

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
}

export function CardsListPage() {
  const { hasRole } = useAuth();
  const { data: cards, isLoading } = useCards();
  const deleteCard = useDeleteCard();
  const isAdmin = hasRole('ADMIN');

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Excluir a tarefa "${title}"?`)) deleteCard.mutate(id);
  };

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Obrigações e demandas do escritório.</p>
        </div>
        <Button asChild>
          <Link to="/tarefas/nova">
            <Plus className="size-4" />
            Nova tarefa
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium">Tarefa</th>
                  <th className="px-4 py-2.5 text-left font-medium">Cliente</th>
                  <th className="px-4 py-2.5 text-left font-medium">Responsável</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Prioridade</th>
                  <th className="px-4 py-2.5 text-left font-medium">Prazo</th>
                  <th className="px-4 py-2.5 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cards?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma tarefa cadastrada.
                    </td>
                  </tr>
                ) : (
                  cards?.map((card) => (
                    <tr key={card.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{card.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {card.client?.tradeName ?? card.client?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{card.assignee?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{card.column?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('border-transparent', priorityStyles[card.priority])}>
                          {priorityLabels[card.priority]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(card.dueDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title="Ver">
                            <Link to={`/tarefas/${card.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" title="Editar">
                            <Link to={`/tarefas/${card.id}/editar`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Excluir"
                              onClick={() => handleDelete(card.id, card.title)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
