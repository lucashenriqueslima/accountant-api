import { ArrowLeft, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCard } from '@/features/cards/api';
import { cardActionLabels, cardActionStyles } from '@/features/cards/constants';
import { priorityLabels, priorityStyles } from '@/features/boards/constants';
import { cn } from '@/lib/utils';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b py-3 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function CardShowPage() {
  const { id } = useParams();
  const { data: card, isLoading, isError } = useCard(id);

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/tarefas">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Detalhes da tarefa</h1>
        </div>
        {card && (
          <Button asChild variant="outline">
            <Link to={`/tarefas/${card.id}/editar`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
        )}
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : isError || !card ? (
          <p className="text-sm text-destructive">Tarefa não encontrada.</p>
        ) : (
          <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
            {/* Detalhes */}
            <section>
              <h2 className="mb-2 text-sm font-semibold">{card.title}</h2>
              <dl className="rounded-xl border px-5">
                <Field label="Descrição" value={card.description || '—'} />
                <Field label="Cliente" value={card.client?.tradeName ?? card.client?.name ?? '—'} />
                <Field label="Responsável" value={card.assignee?.name ?? '—'} />
                <Field label="Status" value={card.column?.name ?? '—'} />
                <Field
                  label="Prioridade"
                  value={
                    <Badge className={cn('border-transparent', priorityStyles[card.priority])}>
                      {priorityLabels[card.priority]}
                    </Badge>
                  }
                />
                <Field label="Prazo" value={formatDate(card.dueDate)} />
              </dl>
            </section>

            {/* Histórico de atividades */}
            <section>
              <h2 className="mb-2 text-sm font-semibold">Histórico</h2>
              <div className="rounded-xl border p-5">
                {card.activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem atividades registradas.</p>
                ) : (
                  <ol className="space-y-4">
                    {card.activities.map((activity) => (
                      <li key={activity.id} className="flex gap-3">
                        <Badge
                          className={cn(
                            'h-fit shrink-0 border-transparent',
                            cardActionStyles[activity.action],
                          )}
                        >
                          {cardActionLabels[activity.action]}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm">{activity.detail}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.user?.name ?? 'Sistema'} · {formatDateTime(activity.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
