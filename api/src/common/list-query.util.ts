import { ListQueryDto } from './dto/list-query.dto';

/** Configuração de filtragem por tabela — declara onde buscar e qual data filtrar. */
export interface ListFilterConfig {
  /**
   * Campos string pesquisáveis pela busca textual. Aceita caminho de relação
   * to-one com ponto, ex.: 'client.name', 'assignee.name'.
   */
  searchFields?: string[];
  /** Campo de data usado pelo filtro de período. Aceita caminho com ponto. */
  dateField?: string;
}

/** Monta `{ a: { b: leaf } }` a partir de um caminho 'a.b'. */
function nestPath(path: string, leaf: unknown): Record<string, unknown> {
  return path
    .split('.')
    .reduceRight<unknown>((acc, key) => ({ [key]: acc }), leaf) as Record<string, unknown>;
}

/**
 * Converte uma data de fronteira. Quando vem só a data (YYYY-MM-DD), o fim do
 * período é estendido até o último milissegundo do dia (filtro inclusivo).
 */
function parseBoundary(value: string, isEnd: boolean): Date {
  const date = new Date(value);
  if (isEnd && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
}

function buildDateRange(from?: string, to?: string): { gte?: Date; lte?: Date } | undefined {
  if (!from && !to) return undefined;
  const range: { gte?: Date; lte?: Date } = {};
  if (from) range.gte = parseBoundary(from, false);
  if (to) range.lte = parseBoundary(to, true);
  return range;
}

/**
 * Monta um fragmento de `where` do Prisma a partir dos parâmetros de listagem.
 * Use espalhando no `where` do `findMany`:
 *
 *   where: { deletedAt: null, ...buildListWhere(query, { searchFields, dateField }) }
 *
 * - `search`: vira um `OR` de `contains` sobre cada campo de `searchFields`
 *   (case-insensitive conforme a collation do MySQL).
 * - `dateFrom`/`dateTo`: vira um range `gte`/`lte` sobre `dateField` (fim inclusivo).
 */
export function buildListWhere(query: ListQueryDto, config: ListFilterConfig): Record<string, any> {
  const and: Record<string, unknown>[] = [];

  const term = query.search?.trim();
  if (term && config.searchFields?.length) {
    and.push({ OR: config.searchFields.map((field) => nestPath(field, { contains: term })) });
  }

  const dateRange = buildDateRange(query.dateFrom, query.dateTo);
  if (dateRange && config.dateField) {
    and.push(nestPath(config.dateField, dateRange));
  }

  return and.length ? { AND: and } : {};
}
