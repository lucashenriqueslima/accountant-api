import { Module } from '@nestjs/common';
import { CardTemplatesController } from './card-templates.controller';
import { CardTemplatesService } from './card-templates.service';
import { CardTemplatesScheduler } from './card-templates.scheduler';
import { CardTemplatesListener } from './card-templates.listener';

@Module({
  controllers: [CardTemplatesController],
  providers: [CardTemplatesService, CardTemplatesScheduler, CardTemplatesListener],
  exports: [CardTemplatesService],
})
export class CardTemplatesModule {}
