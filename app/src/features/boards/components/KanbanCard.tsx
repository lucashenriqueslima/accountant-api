import { Building2, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/types';
import { priorityLabels, priorityStyles } from '../constants';
import { CardAssignButton } from './CardAssignButton';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface KanbanCardProps {
  card: CardType;
  onDragStart: (cardId: string) => void;
}

export function KanbanCard({ card, onDragStart }: KanbanCardProps) {
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completedAt;

  return (
    <article
      draggable
      onDragStart={() => onDragStart(card.id)}
      className="cursor-grab space-y-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{card.title}</p>
        <Badge className={cn('shrink-0 border-transparent', priorityStyles[card.priority])}>
          {priorityLabels[card.priority]}
        </Badge>
      </div>

      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map(({ label }) => (
            <span
              key={label.id}
              className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {card.client && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="size-3.5" />
          <span className="truncate">{card.client.tradeName ?? card.client.name}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        {card.dueDate ? (
          <span
            className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'font-medium text-red-600' : 'text-muted-foreground',
            )}
          >
            <CalendarDays className="size-3.5" />
            {formatDate(card.dueDate)}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1">
          {card.assignee && (
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">{initials(card.assignee.name)}</AvatarFallback>
            </Avatar>
          )}
          <CardAssignButton card={card} />
        </div>
      </div>
    </article>
  );
}
