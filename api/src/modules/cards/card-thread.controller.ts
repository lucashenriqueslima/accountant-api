import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  MaxFileSizeValidator,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CardAttachmentsService } from './card-attachments.service';
import { CardCommentsService } from './card-comments.service';
import { CardEmailsService } from './card-emails.service';
import { CreateCardCommentDto } from './dto/create-card-comment.dto';
import { SendCardEmailDto } from './dto/send-card-email.dto';

// 20 MB — mesmo limite dos documentos de cliente.
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const fileValidator = new ParseFilePipe({
  validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
});

/// Comentários, anexos e e-mails de uma tarefa (disponível a qualquer usuário autenticado).
@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards/:cardId')
export class CardThreadController {
  constructor(
    private readonly comments: CardCommentsService,
    private readonly attachments: CardAttachmentsService,
    private readonly emails: CardEmailsService,
  ) {}

  // ─── Comentários ─────────────────────────────────────────────────────

  @Get('comments')
  listComments(@Param('cardId') cardId: string) {
    return this.comments.list(cardId);
  }

  @Post('comments')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        body: { type: 'string' },
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  createComment(
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardCommentDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.comments.create(cardId, dto.body, files, user);
  }

  @Delete('comments/:commentId')
  removeComment(
    @Param('cardId') cardId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.comments.remove(cardId, commentId, user);
  }

  // ─── Anexos da tarefa ────────────────────────────────────────────────

  @Get('attachments')
  listAttachments(@Param('cardId') cardId: string) {
    return this.attachments.list(cardId);
  }

  @Post('attachments')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  addAttachment(
    @Param('cardId') cardId: string,
    @UploadedFile(fileValidator) file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attachments.add(cardId, file, user);
  }

  @Delete('attachments/:attachmentId')
  removeAttachment(
    @Param('cardId') cardId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.attachments.remove(cardId, attachmentId);
  }

  // ─── E-mails ─────────────────────────────────────────────────────────

  @Get('emails')
  listEmails(@Param('cardId') cardId: string) {
    return this.emails.list(cardId);
  }

  @Post('emails')
  sendEmail(
    @Param('cardId') cardId: string,
    @Body() dto: SendCardEmailDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.emails.send(cardId, dto, user);
  }
}
