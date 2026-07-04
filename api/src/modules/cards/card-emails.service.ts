import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { MailService } from '../mail/mail.service';
import { CardAttachmentsService } from './card-attachments.service';
import { SendCardEmailDto } from './dto/send-card-email.dto';

/// Normaliza um nome de coluna para comparação (sem acentos, minúsculo).
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/// Uma tarefa está "concluída" quando está na coluna "Concluído" do quadro.
export function isDoneColumnName(name: string | undefined | null): boolean {
  return name ? normalize(name) === 'concluido' : false;
}

@Injectable()
export class CardEmailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachments: CardAttachmentsService,
    private readonly mail: MailService,
  ) {}

  async list(cardId: string) {
    await this.ensureCardExists(cardId);
    return this.prisma.cardEmail.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: { sentBy: { select: { id: true, name: true } } },
    });
  }

  async send(cardId: string, dto: SendCardEmailDto, user: AuthenticatedUser) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, deletedAt: null },
      include: { column: { select: { name: true } } },
    });
    if (!card) throw new NotFoundException(`Tarefa ${cardId} não encontrada`);

    if (!isDoneColumnName(card.column?.name)) {
      throw new ForbiddenException('O envio de e-mail só está disponível para tarefas concluídas');
    }

    const files = await this.attachments.loadForEmail(cardId, dto.attachmentIds ?? []);
    const attachmentLabel = files.map((f) => f.filename).join(', ') || null;
    const recipients = dto.to.join(', ');
    const cc = dto.cc?.length ? dto.cc.join(', ') : null;

    try {
      await this.mail.send({
        to: dto.to,
        cc: dto.cc,
        subject: dto.subject,
        html: dto.body,
        attachments: files,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar o e-mail';
      await this.prisma.cardEmail.create({
        data: {
          cardId,
          recipients,
          cc,
          subject: dto.subject,
          body: dto.body,
          attachments: attachmentLabel,
          status: 'FAILED',
          error: message,
          sentById: user.id,
        },
      });
      throw new InternalServerErrorException(`Não foi possível enviar o e-mail: ${message}`);
    }

    return this.prisma.cardEmail.create({
      data: {
        cardId,
        recipients,
        cc,
        subject: dto.subject,
        body: dto.body,
        attachments: attachmentLabel,
        status: 'SENT',
        sentById: user.id,
      },
      include: { sentBy: { select: { id: true, name: true } } },
    });
  }

  private async ensureCardExists(cardId: string) {
    const exists = await this.prisma.card.findFirst({
      where: { id: cardId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Tarefa ${cardId} não encontrada`);
  }
}
