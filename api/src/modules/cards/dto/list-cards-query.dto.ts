import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ListQueryDto } from '../../../common/dto/list-query.dto';

/** Parâmetros da listagem de tarefas: busca + período + filtro por coluna. */
export class ListCardsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Filtra as tarefas de uma coluna específica.' })
  @IsOptional()
  @IsString()
  columnId?: string;
}
