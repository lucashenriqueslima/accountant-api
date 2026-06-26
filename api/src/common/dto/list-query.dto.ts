import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * DTO base reutilizável para qualquer listagem com busca textual e filtro de
 * período. Estenda-o quando a rota precisar de parâmetros extras (ex.: columnId).
 */
export class ListQueryDto {
  @ApiPropertyOptional({ description: 'Busca textual aplicada a todos os campos relevantes da tabela.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Início do período (ISO ou YYYY-MM-DD).', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Fim do período (ISO ou YYYY-MM-DD), inclusivo.', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
