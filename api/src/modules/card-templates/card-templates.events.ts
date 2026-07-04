/// Evento disparado (pelo cron diário ou manualmente) para gerar os cartões
/// a partir dos Modelos de Tarefa. O listener é quem executa a geração.
export const CARD_TEMPLATES_GENERATE_EVENT = 'card-templates.generate';

/// Resultado devolvido pelo listener — usado pelo disparo manual via `emitAsync`.
export interface GenerateCardsResult {
  /// Quantidade de cartões efetivamente criados.
  created: number;
  /// Quantidade de modelos pulados por já existir cartão no período atual.
  skipped: number;
  /// Quantidade de modelos ativos processados.
  templates: number;
}
