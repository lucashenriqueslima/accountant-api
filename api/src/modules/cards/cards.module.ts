import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { CardAttachmentsService } from './card-attachments.service';
import { CardCommentsService } from './card-comments.service';
import { CardEmailsService } from './card-emails.service';
import { CardThreadController } from './card-thread.controller';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [MailModule],
  controllers: [CardsController, CardThreadController],
  providers: [CardsService, CardCommentsService, CardAttachmentsService, CardEmailsService],
  exports: [CardsService],
})
export class CardsModule {}
