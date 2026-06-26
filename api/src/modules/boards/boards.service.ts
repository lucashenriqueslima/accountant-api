import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

const cardInclude = {
  client: true,
  assignee: true,
  labels: { include: { label: true } },
} satisfies Prisma.CardInclude;

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBoardDto) {
    return this.prisma.board.create({ data: dto });
  }

  findAll() {
    return this.prisma.board.findMany({ orderBy: { position: 'asc' } });
  }

  /// Quadro completo. `assigneeId` filtra os cartões por responsável (opcional).
  async findOne(id: string, assigneeId?: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { deletedAt: null, ...(assigneeId ? { assigneeId } : {}) },
              orderBy: { position: 'asc' },
              include: cardInclude,
            },
          },
        },
      },
    });
    if (!board) throw new NotFoundException(`Quadro ${id} não encontrado`);
    return board;
  }

  /// "Meu board" — quadros que contêm cartões atribuídos ao usuário,
  /// trazendo apenas os cartões dele. Usado por todos os papéis.
  findMine(userId: string) {
    return this.prisma.board.findMany({
      where: { columns: { some: { cards: { some: { assigneeId: userId, deletedAt: null } } } } },
      orderBy: { position: 'asc' },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { assigneeId: userId, deletedAt: null },
              orderBy: { position: 'asc' },
              include: cardInclude,
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateBoardDto) {
    await this.ensureExists(id);
    return this.prisma.board.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.board.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.board.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Quadro ${id} não encontrado`);
  }
}
