import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardFrequency, Priority } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCardTemplateDto {
  @ApiProperty({ example: 'Apuração de ICMS' })
  @IsString()
  @MinLength(1)
  @MaxLength(191)
  title!: string;

  @ApiPropertyOptional({ description: 'Descrição copiada para cada cartão gerado' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'clx123abc',
    description: 'Quadro onde os cartões serão criados (na coluna "A fazer")',
  })
  @IsString()
  boardId!: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    enum: CardFrequency,
    default: CardFrequency.MONTHLY,
    description: 'Periodicidade da geração: MONTHLY (mensal) ou YEARLY (anual)',
  })
  @IsOptional()
  @IsEnum(CardFrequency)
  frequency?: CardFrequency;

  @ApiPropertyOptional({ description: 'Cliente vinculado aos cartões gerados' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ default: true, description: 'Apenas modelos ativos geram cartões' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
