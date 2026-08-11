import type { BoardWithColumns, Column } from '@/types';

/// Empresa (cliente) disponível no filtro do quadro.
export interface ClientOption {
  id: string;
  name: string;
}

/// Empresas presentes nos cartões do quadro — opções do filtro por empresa.
/// Só entram na lista as empresas que realmente têm tarefas à vista.
export function boardClientOptions(board?: BoardWithColumns): ClientOption[] {
  const byId = new Map<string, string>();
  for (const column of board?.columns ?? []) {
    for (const card of column.cards) {
      if (card.client) byId.set(card.client.id, card.client.tradeName ?? card.client.name);
    }
  }
  return [...byId]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/// Mantém apenas os cartões das empresas selecionadas. Lista vazia = sem filtro.
export function filterColumnsByClients(columns: Column[], clientIds: string[]): Column[] {
  if (clientIds.length === 0) return columns;
  const selected = new Set(clientIds);
  return columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.clientId && selected.has(card.clientId)),
  }));
}
