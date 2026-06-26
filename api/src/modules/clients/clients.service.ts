import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientDocument } from '@prisma/client';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { buildListWhere } from '../../common/list-query.util';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StorageService, type StorageDriver } from '../storage/storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  findAll(query: ListQueryDto = {}) {
    return this.prisma.client.findMany({
      where: buildListWhere(query, {
        searchFields: ['name', 'tradeName', 'document', 'email', 'phone'],
        dateField: 'createdAt',
      }),
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        cards: { where: { deletedAt: null }, include: { column: true } },
        documents: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { id: true, name: true } } },
        },
      },
    });
    if (!client) throw new NotFoundException(`Cliente ${id} não encontrado`);

    const documents = await Promise.all(client.documents.map((d) => this.withUrl(d)));
    return { ...client, documents };
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.ensureExists(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.client.delete({ where: { id } });
  }

  // ─── Documentos ──────────────────────────────────────────────────────

  async listDocuments(clientId: string) {
    await this.ensureExists(clientId);
    const docs = await this.prisma.clientDocument.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });
    return Promise.all(docs.map((d) => this.withUrl(d)));
  }

  async addDocument(clientId: string, file: Express.Multer.File, user: AuthenticatedUser) {
    await this.ensureExists(clientId);

    const { key, driver, size } = await this.storage.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      keyPrefix: `clients/${clientId}`,
    });

    const doc = await this.prisma.clientDocument.create({
      data: {
        clientId,
        filename: file.originalname,
        key,
        driver,
        size,
        mimeType: file.mimetype,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return this.withUrl(doc);
  }

  async removeDocument(clientId: string, documentId: string) {
    const doc = await this.prisma.clientDocument.findFirst({ where: { id: documentId, clientId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');

    await this.storage.remove(doc.key, doc.driver as StorageDriver);
    return this.prisma.clientDocument.delete({ where: { id: documentId } });
  }

  private async withUrl<T extends ClientDocument>(doc: T) {
    return { ...doc, url: await this.storage.getUrl(doc.key, doc.driver as StorageDriver) };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.client.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Cliente ${id} não encontrado`);
  }
}
