import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CardAction, CardFrequency } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { GenerateCardsResult } from './card-templates.events';

const templateInclude = {
  board: { select: { id: true, name: true } },
  client: { select: { id: true, name: true } },
};

@Injectable()
export class CardTemplatesService {
  private readonly logger = new Logger(CardTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  findAll() {
    return this.prisma.cardTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      include: templateInclude,
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.cardTemplate.findUnique({
      where: { id },
      include: templateInclude,
    });
    if (!template) throw new NotFoundException(`Modelo de card ${id} não encontrado`);
    return template;
  }

  async create(dto: CreateCardTemplateDto) {
    await this.ensureBoardExists(dto.boardId);
    return this.prisma.cardTemplate.create({
      data: { ...dto, title: dto.title.trim() },
      include: templateInclude,
    });
  }

  async update(id: string, dto: UpdateCardTemplateDto) {
    await this.ensureExists(id);
    if (dto.boardId) await this.ensureBoardExists(dto.boardId);
    return this.prisma.cardTemplate.update({
      where: { id },
      data: { ...dto, ...(dto.title !== undefined ? { title: dto.title.trim() } : {}) },
      include: templateInclude,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.cardTemplate.delete({ where: { id } });
  }

  // ---------------------------------------------------------------------------
  // Geração de cartões (executada pelo cron diário e pelo disparo manual)
  // ---------------------------------------------------------------------------

  /// Lê todos os modelos ativos e cria, para cada um, um cartão na coluna
  /// "A fazer" do quadro do modelo — sem responsável e sem criador (sistema).
  /// Respeita a frequência: se já houver cartão gerado por aquele modelo no
  /// período atual (mês, para MONTHLY; ano, para YEARLY), o modelo é pulado.
  async generateCardsFromTemplates(reference: Date = new Date()): Promise<GenerateCardsResult> {
    const templates = await this.prisma.cardTemplate.findMany({
      where: { active: true },
      include: { board: { include: { columns: true } } },
    });

    let created = 0;
    let skipped = 0;
    for (const template of templates) {
      // Já existe cartão deste modelo no período atual? Então não duplica.
      const { start, end } = this.periodRange(template.frequency, reference);
      const already = await this.prisma.card.findFirst({
        where: { cardTemplateId: template.id, createdAt: { gte: start, lt: end } },
        select: { id: true },
      });
      if (already) {
        skipped += 1;
        continue;
      }

      const todo = this.resolveTodoColumn(template.board.columns);
      if (!todo) {
        this.logger.warn(
          `Modelo "${template.title}" ignorado: quadro ${template.boardId} não tem coluna "A fazer".`,
        );
        continue;
      }

      // Posiciona o novo cartão no fim da coluna.
      const last = await this.prisma.card.findFirst({
        where: { columnId: todo.id },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      const position = last ? last.position + 1 : 0;

      const card = await this.prisma.card.create({
        data: {
          title: template.title,
          description: template.description,
          priority: template.priority,
          position,
          columnId: todo.id,
          clientId: template.clientId,
          cardTemplateId: template.id,
          // sem assigneeId (responsável) nem createdById (criador): gerado pelo sistema.
        },
      });

      await this.prisma.cardActivity.create({
        data: {
          cardId: card.id,
          action: CardAction.CREATED,
          detail: `Tarefa criada automaticamente a partir do modelo "${template.title}"`,
        },
      });
      created += 1;
    }

    this.logger.log(
      `Geração concluída: ${created} cartão(ões) criado(s), ${skipped} pulado(s) por já existirem no período, ` +
        `a partir de ${templates.length} modelo(s) ativo(s).`,
    );
    return { created, skipped, templates: templates.length };
  }

  /// Intervalo [início, fim) do período atual conforme a frequência do modelo.
  /// MONTHLY → mês corrente; YEARLY → ano corrente.
  private periodRange(frequency: CardFrequency, reference: Date) {
    const year = reference.getFullYear();
    if (frequency === CardFrequency.YEARLY) {
      return { start: new Date(year, 0, 1), end: new Date(year + 1, 0, 1) };
    }
    const month = reference.getMonth();
    return { start: new Date(year, month, 1), end: new Date(year, month + 1, 1) };
  }

  /// Localiza a coluna "A fazer" do quadro (por nome); na ausência, usa a
  /// primeira coluna (menor `position`).
  private resolveTodoColumn(columns: { id: string; name: string; position: number }[]) {
    if (columns.length === 0) return undefined;
    return (
      columns.find((c) => c.name.trim().toLowerCase() === 'a fazer') ??
      [...columns].sort((a, b) => a.position - b.position)[0]
    );
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.cardTemplate.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Modelo de card ${id} não encontrado`);
  }

  private async ensureBoardExists(boardId: string) {
    const exists = await this.prisma.board.findUnique({ where: { id: boardId }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Quadro ${boardId} não encontrado`);
  }
}
