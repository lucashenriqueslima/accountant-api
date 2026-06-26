import type { CardAction } from '@/types';

export const cardActionLabels: Record<CardAction, string> = {
  CREATED: 'Criou',
  UPDATED: 'Atualizou',
  MOVED: 'Moveu',
  ASSIGNED: 'Atribuiu',
  DELETED: 'Excluiu',
};

export const cardActionStyles: Record<CardAction, string> = {
  CREATED: 'bg-green-100 text-green-700',
  UPDATED: 'bg-blue-100 text-blue-700',
  MOVED: 'bg-amber-100 text-amber-700',
  ASSIGNED: 'bg-violet-100 text-violet-700',
  DELETED: 'bg-red-100 text-red-700',
};
