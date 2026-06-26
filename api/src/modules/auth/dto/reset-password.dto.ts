import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recebido por e-mail' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NovaSenha@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
