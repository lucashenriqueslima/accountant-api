import { Injectable, NotFoundException } from '@nestjs/common';
import { CardAttachment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StorageService, type StorageDriver } from '../storage/storage.service';

@Injectable()
export class CardAttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /// Anexos da própria tarefa (aba "Anexos" — sem comentário vinculado).
  async list(cardId: string) {
    await this.ensureCardExists(cardId);
    const files = await this.prisma.cardAttachment.findMany({
      where: { cardId, commentId: null },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    return Promise.all(files.map((f) => this.withUrl(f)));
  }

  /// Adiciona um anexo à tarefa (sem comentário).
  async add(cardId: string, file: Express.Multer.File, user: AuthenticatedUser) {
    await this.ensureCardExists(cardId);
    const created = await this.store(cardId, file, user);
    return this.withUrl(created);
  }

  async remove(cardId: string, attachmentId: string) {
    const file = await this.prisma.cardAttachment.findFirst({
      where: { id: attachmentId, cardId },
    });
    if (!file) throw new NotFoundException('Anexo não encontrado');

    await this.storage.remove(file.key, file.driver as StorageDriver);
    return this.prisma.cardAttachment.delete({ where: { id: attachmentId } });
  }

  /// Persiste um arquivo no storage e cria o registro do anexo.
  /// `commentId` vincula o anexo a um comentário; ausente = anexo da tarefa.
  async store(
    cardId: string,
    file: Express.Multer.File,
    user: AuthenticatedUser,
    commentId?: string,
  ) {
    const { key, driver, size } = await this.storage.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      keyPrefix: `cards/${cardId}`,
    });

    return this.prisma.cardAttachment.create({
      data: {
        cardId,
        commentId,
        filename: file.originalname,
        key,
        driver,
        size,
        mimeType: file.mimetype,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
  }

  /// Remove os arquivos do storage de um conjunto de anexos (sem mexer no banco —
  /// usado antes de um delete em cascata).
  async removeFromStorage(files: Pick<CardAttachment, 'key' | 'driver'>[]) {
    await Promise.all(files.map((f) => this.storage.remove(f.key, f.driver as StorageDriver)));
  }

  /// Anexos da tarefa por id (validando que pertencem à tarefa), com o buffer
  /// já carregado — usado ao montar os anexos de um e-mail.
  async loadForEmail(cardId: string, ids: string[]) {
    const files = await this.prisma.cardAttachment.findMany({
      where: { id: { in: ids }, cardId },
    });
    return Promise.all(
      files.map(async (f) => ({
        filename: f.filename,
        content: await this.storage.getBuffer(f.key, f.driver as StorageDriver),
      })),
    );
  }

  async withUrl<T extends CardAttachment>(file: T) {
    return { ...file, url: await this.storage.getUrl(file.key, file.driver as StorageDriver) };
  }

  private async ensureCardExists(cardId: string) {
    const exists = await this.prisma.card.findFirst({
      where: { id: cardId, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Tarefa ${cardId} não encontrada`);
  }
}
