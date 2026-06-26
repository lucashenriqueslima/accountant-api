import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardTypeDto } from './dto/create-card-type.dto';
import { UpdateCardTypeDto } from './dto/update-card-type.dto';

@Injectable()
export class CardTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cardType.findMany({ orderBy: { title: 'asc' } });
  }

  async create(dto: CreateCardTypeDto) {
    try {
      return await this.prisma.cardType.create({ data: { title: dto.title.trim() } });
    } catch (err) {
      throw this.translateError(err, dto.title);
    }
  }

  async update(id: string, dto: UpdateCardTypeDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.cardType.update({
        where: { id },
        data: { ...(dto.title !== undefined ? { title: dto.title.trim() } : {}) },
      });
    } catch (err) {
      throw this.translateError(err, dto.title);
    }
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.cardType.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.cardType.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Tipo de tarefa ${id} não encontrado`);
  }

  /// Converte a violação de chave única do Prisma em um 409 amigável.
  private translateError(err: unknown, title?: string) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return new ConflictException(`Já existe um tipo de tarefa "${title}"`);
    }
    return err;
  }
}
