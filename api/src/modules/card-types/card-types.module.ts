import { Module } from '@nestjs/common';
import { CardTypesController } from './card-types.controller';
import { CardTypesService } from './card-types.service';

@Module({
  controllers: [CardTypesController],
  providers: [CardTypesService],
  exports: [CardTypesService],
})
export class CardTypesModule {}
