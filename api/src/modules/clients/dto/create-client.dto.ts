import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { TaxRegime } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({ example: 'Padaria Pão Quente Ltda' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Pão Quente' })
  @IsOptional()
  @IsString()
  tradeName?: string;

  @ApiProperty({ example: '12.345.678/0001-90', description: 'CNPJ ou CPF' })
  @IsString()
  document!: string;

  @ApiPropertyOptional({ enum: TaxRegime, default: TaxRegime.SIMPLES_NACIONAL })
  @IsOptional()
  @IsEnum(TaxRegime)
  taxRegime?: TaxRegime;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
