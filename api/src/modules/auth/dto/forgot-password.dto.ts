import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@fortecontabilidade.com.br' })
  @IsEmail()
  email!: string;
}
