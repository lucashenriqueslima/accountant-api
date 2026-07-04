import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CardAttachmentsService } from './card-attachments.service';

const commentInclude = {
  author: { select: { id: true, name: true } },
  attachments: { orderBy: { createdAt: 'asc' } },
} as const;

@Injectable()
export class CardCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachments: CardAttachmentsService,
  ) {}

  async list(cardId: string) {
    await this.ensureCardExists(cardId);
    const comments = await this.prisma.cardComment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: commentInclude,
    });
    // Anexa as URLs de download a cada arquivo do comentário.
    return Promise.all(
      comments.map(async (c) => ({
        ...c,
        attachments: await Promise.all(c.attachments.map((a) => this.attachments.withUrl(a))),
      })),
    );
  }

  /// Cria um comentário e vincula os arquivos enviados como anexos dele.
  async create(
    cardId: string,
    body: string,
    files: Express.Multer.File[],
    user: AuthenticatedUser,
  ) {
    await this.ensureCardExists(cardId);

    const comment = await this.prisma.cardComment.create({
      data: { cardId, body, authorId: user.id },
    });

    for (const file of files ?? []) {
      await this.attachments.store(cardId, file, user, comment.id);
    }

    return this.findOne(comment.id);
  }

  async remove(cardId: string, commentId: string, user: AuthenticatedUser) {
    const comment = await this.prisma.cardComment.findFirst({
      where: { id: commentId, cardId },
      include: { attachments: { select: { key: true, driver: true } } },
    });
    if (!comment) throw new NotFoundException('Comentário não encontrado');

    // Só o autor ou um administrador podem excluir.
    if (comment.authorId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Você só pode excluir os seus próprios comentários');
    }

    // Remove os arquivos do storage antes do delete em cascata dos registros.
    await this.attachments.removeFromStorage(comment.attachments);
    return this.prisma.cardComment.delete({ where: { id: commentId } });
  }

  private async findOne(commentId: string) {
    const comment = await this.prisma.cardComment.findUniqueOrThrow({
      where: { id: commentId },
      include: commentInclude,
    });
    return {
      ...comment,
      attachments: await Promise.all(comment.attachments.map((a) => this.attachments.withUrl(a))),
    };
  }

  private async ensureCardExists(cardId: string) {
    const exists = await this.prisma.card.findFirst({
      where: { id: cardId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Tarefa ${cardId} não encontrada`);
  }
}
