import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SendCardEmailDto {
  @ApiProperty({ type: [String], description: 'Destinatários do e-mail' })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  to!: string[];

  @ApiPropertyOptional({ type: [String], description: 'Cópia (CC)' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiProperty({ example: 'Obrigação concluída — Maio/2026' })
  @IsString()
  @MinLength(1)
  subject!: string;

  @ApiProperty({ description: 'Corpo do e-mail em HTML (rich text)' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'IDs de anexos da tarefa a incluir no e-mail',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentIds?: string[];
}
