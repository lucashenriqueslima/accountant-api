import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'Em andamento' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'clx123abc', description: 'ID do quadro' })
  @IsString()
  boardId!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsOptional()
  @IsString()
  color?: string;
}
