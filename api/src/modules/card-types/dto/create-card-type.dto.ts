import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCardTypeDto {
  @ApiProperty({ example: 'Apuração de ICMS' })
  @IsString()
  @MinLength(1)
  @MaxLength(191)
  title!: string;
}
