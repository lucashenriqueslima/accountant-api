/** Parâmetros comuns de listagem (busca + período) compartilhados pelas tabelas. */
export interface ListParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Serializa os parâmetros de listagem em querystring, ignorando valores vazios.
 * Ex.: `{ search: 'ana', dateFrom: '' }` → `'?search=ana'`.
 */
export function toQueryString(params: ListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
