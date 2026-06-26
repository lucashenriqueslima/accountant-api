import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

/// Move um cartão para outra coluna e/ou posição (drag-and-drop).
export class MoveCardDto {
  @ApiProperty({ description: 'ID da coluna de destino' })
  @IsString()
  columnId!: string;

  @ApiProperty({ description: 'Nova posição (0 = topo)', example: 0 })
  @IsInt()
  @Min(0)
  position!: number;
}
