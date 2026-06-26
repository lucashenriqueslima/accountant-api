import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CardTypesService } from './card-types.service';
import { CreateCardTypeDto } from './dto/create-card-type.dto';
import { UpdateCardTypeDto } from './dto/update-card-type.dto';

@ApiTags('card-types')
@ApiBearerAuth()
@Controller('card-types')
export class CardTypesController {
  constructor(private readonly cardTypesService: CardTypesService) {}

  // Listar — qualquer usuário autenticado (alimenta o combobox de título).
  @Get()
  findAll() {
    return this.cardTypesService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateCardTypeDto) {
    return this.cardTypesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateCardTypeDto) {
    return this.cardTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.cardTypesService.remove(id);
  }
}
