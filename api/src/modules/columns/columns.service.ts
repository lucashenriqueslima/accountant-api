import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateColumnDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: dto.boardId },
      select: { id: true },
    });
    if (!board) throw new NotFoundException(`Quadro ${dto.boardId} não encontrado`);
    return this.prisma.column.create({ data: dto });
  }

  findByBoard(boardId: string) {
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: { cards: { orderBy: { position: 'asc' } } },
    });
  }

  async update(id: string, dto: UpdateColumnDto) {
    await this.ensureExists(id);
    return this.prisma.column.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.column.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.column.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Coluna ${id} não encontrada`);
  }
}
