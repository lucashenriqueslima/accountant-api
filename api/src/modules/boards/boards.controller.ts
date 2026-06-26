import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // "Meu board" — disponível para qualquer usuário autenticado.
  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.boardsService.findMine(user.id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateBoardDto) {
    return this.boardsService.create(dto);
  }

  // Quadros da equipe — admin e gestor.
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string, @Query('assigneeId') assigneeId?: string) {
    return this.boardsService.findOne(id, assigneeId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.boardsService.remove(id);
  }
}
