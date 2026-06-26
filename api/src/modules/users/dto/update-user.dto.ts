import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Todos os campos opcionais — inclusive password (só atualiza se enviado).
export class UpdateUserDto extends PartialType(CreateUserDto) {}
