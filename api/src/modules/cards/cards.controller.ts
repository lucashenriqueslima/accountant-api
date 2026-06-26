import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { ListCardsQueryDto } from './dto/list-cards-query.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // Minhas tarefas — qualquer usuário autenticado.
  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.cardsService.findMine(user.id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateCardDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cardsService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Query() query: ListCardsQueryDto) {
    return this.cardsService.findAll(query);
  }

  // Detalhe + histórico de atividades.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOneWithActivities(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCardDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cardsService.update(id, dto, user);
  }

  // Mover (executar): admin/gestor movem qualquer cartão; colaborador só os seus.
  @Patch(':id/move')
  move(@Param('id') id: string, @Body() dto: MoveCardDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cardsService.move(id, dto, user);
  }

  // Soft delete: apenas administrador.
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cardsService.softDelete(id, user);
  }
}
