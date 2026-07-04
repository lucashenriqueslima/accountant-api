import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCardCommentDto {
  @ApiProperty({ description: 'Conteúdo do comentário em HTML (rich text)' })
  @IsString()
  @MinLength(1)
  body!: string;
}
