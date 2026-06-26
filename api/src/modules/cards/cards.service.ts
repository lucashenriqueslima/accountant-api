import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CardAction, Prisma, Role } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

const cardInclude = {
  client: true,
  assignee: true,
  column: true,
  labels: { include: { label: true } },
} satisfies Prisma.CardInclude;

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCardDto, user: AuthenticatedUser) {
    const { dueDate, createdById: _ignored, ...rest } = dto;

    const card = await this.prisma.card.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        createdById: user.id,
      },
      include: cardInclude,
    });

    await this.log(card.id, user.id, CardAction.CREATED, 'Tarefa criada');
    return card;
  }

  findAll(columnId?: string) {
    return this.prisma.card.findMany({
      where: { deletedAt: null, ...(columnId ? { columnId } : {}) },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
      include: cardInclude,
    });
  }

  /// Cartões atribuídos ao usuário (suas demandas).
  findMine(userId: string) {
    return this.prisma.card.findMany({
      where: { assigneeId: userId, deletedAt: null },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
      include: cardInclude,
    });
  }

  async findOne(id: string) {
    const card = await this.prisma.card.findFirst({
      where: { id, deletedAt: null },
      include: cardInclude,
    });
    if (!card) throw new NotFoundException(`Tarefa ${id} não encontrada`);
    return card;
  }

  /// Tarefa + histórico de atividades (quem, quando, o quê).
  async findOneWithActivities(id: string) {
    const card = await this.findOne(id);
    const activities = await this.prisma.cardActivity.findMany({
      where: { cardId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
    return { ...card, activities };
  }

  async update(id: string, dto: UpdateCardDto, user: AuthenticatedUser) {
    const current = await this.findOne(id);
    const { dueDate, createdById: _ignored, ...rest } = dto;

    const updated = await this.prisma.card.update({
      where: { id },
      data: { ...rest, dueDate: dueDate !== undefined ? new Date(dueDate) : undefined },
      include: cardInclude,
    });

    // Atribuição de responsável gera um log próprio.
    if (dto.assigneeId !== undefined && dto.assigneeId !== current.assigneeId) {
      const detail = updated.assignee
        ? `Atribuída para ${updated.assignee.name}`
        : 'Responsável removido';
      await this.log(id, user.id, CardAction.ASSIGNED, detail);
    } else {
      await this.log(id, user.id, CardAction.UPDATED, this.describeChanges(rest));
    }

    return updated;
  }

  /// Move o cartão para uma coluna/posição, reordenando os demais.
  /// Colaboradores (EMPLOYEE) só podem mover cartões atribuídos a eles.
  async move(id: string, dto: MoveCardDto, user: AuthenticatedUser) {
    const card = await this.findOne(id);

    if (user.role === Role.EMPLOYEE && card.assigneeId !== user.id) {
      throw new ForbiddenException('Você só pode mover as suas próprias tarefas');
    }

    const { columnId: targetColumnId, position: targetPosition } = dto;

    const moved = await this.prisma.$transaction(async (tx) => {
      await tx.card.updateMany({
        where: { columnId: card.columnId, position: { gt: card.position } },
        data: { position: { decrement: 1 } },
      });
      await tx.card.updateMany({
        where: { columnId: targetColumnId, position: { gte: targetPosition } },
        data: { position: { increment: 1 } },
      });
      return tx.card.update({
        where: { id },
        data: { columnId: targetColumnId, position: targetPosition },
        include: cardInclude,
      });
    });

    if (targetColumnId !== card.columnId) {
      await this.log(id, user.id, CardAction.MOVED, `Movida para "${moved.column.name}"`);
    }
    return moved;
  }

  /// Soft delete (apenas admin — validado no controller).
  async softDelete(id: string, user: AuthenticatedUser) {
    await this.findOne(id);
    const deleted = await this.prisma.card.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.log(id, user.id, CardAction.DELETED, 'Tarefa excluída');
    return deleted;
  }

  private log(cardId: string, userId: string, action: CardAction, detail: string) {
    return this.prisma.cardActivity.create({ data: { cardId, userId, action, detail } });
  }

  private describeChanges(changed: Record<string, unknown>): string {
    const labels: Record<string, string> = {
      title: 'título',
      description: 'descrição',
      priority: 'prioridade',
      dueDate: 'prazo',
      columnId: 'coluna',
      clientId: 'cliente',
    };
    const fields = Object.keys(changed)
      .map((k) => labels[k])
      .filter(Boolean);
    return fields.length ? `Alterou: ${fields.join(', ')}` : 'Tarefa atualizada';
  }
}
