import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CardTemplatesService } from './card-templates.service';
import { CARD_TEMPLATES_GENERATE_EVENT, GenerateCardsResult } from './card-templates.events';

@Injectable()
export class CardTemplatesListener {
  private readonly logger = new Logger(CardTemplatesListener.name);

  constructor(private readonly service: CardTemplatesService) {}

  /// Reage ao evento (vindo do cron diário ou do disparo manual) e gera os
  /// cartões. Retorna o resultado para que o disparo via `emitAsync` o receba.
  @OnEvent(CARD_TEMPLATES_GENERATE_EVENT, { promisify: true })
  async handleGenerate(): Promise<GenerateCardsResult> {
    this.logger.log(`Evento "${CARD_TEMPLATES_GENERATE_EVENT}" recebido — gerando cartões.`);
    return this.service.generateCardsFromTemplates();
  }
}
