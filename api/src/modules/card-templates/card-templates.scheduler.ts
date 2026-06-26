import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CARD_TEMPLATES_GENERATE_EVENT } from './card-templates.events';

@Injectable()
export class CardTemplatesScheduler {
  private readonly logger = new Logger(CardTemplatesScheduler.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /// Todos os dias às 00:01 (horário de Brasília). O cron apenas dispara o
  /// evento; quem gera os cartões é o `CardTemplatesListener`.
  @Cron('1 0 * * *', {
    name: 'generate-cards-from-templates',
    timeZone: 'America/Sao_Paulo',
  })
  handleDailyGeneration() {
    this.logger.log('Cron 00:01 — disparando geração de cartões a partir dos modelos.');
    this.eventEmitter.emit(CARD_TEMPLATES_GENERATE_EVENT);
  }
}
