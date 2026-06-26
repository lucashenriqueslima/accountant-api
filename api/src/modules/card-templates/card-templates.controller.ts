import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CardTemplatesService } from './card-templates.service';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { CARD_TEMPLATES_GENERATE_EVENT, GenerateCardsResult } from './card-templates.events';

@ApiTags('card-templates')
@ApiBearerAuth()
@Controller('card-templates')
export class CardTemplatesController {
  constructor(
    private readonly cardTemplatesService: CardTemplatesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.cardTemplatesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.cardTemplatesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateCardTemplateDto) {
    return this.cardTemplatesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCardTemplateDto) {
    return this.cardTemplatesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.cardTemplatesService.remove(id);
  }

  // Disparo manual da mesma rotina do cron — útil para testar/forçar a geração.
  // Emite o evento e aguarda o listener, devolvendo quantos cartões foram criados.
  @Post('generate')
  @HttpCode(200)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Gera os cartões a partir dos modelos ativos (mesma rotina do cron diário)' })
  async generate(): Promise<GenerateCardsResult> {
    const [result] = await this.eventEmitter.emitAsync(CARD_TEMPLATES_GENERATE_EVENT);
    return result as GenerateCardsResult;
  }
}
