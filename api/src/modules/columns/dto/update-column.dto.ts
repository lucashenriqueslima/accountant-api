import { PartialType } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { CreateColumnDto } from './create-column.dto';

// boardId não é alterável após a criação da coluna.
export class UpdateColumnDto extends PartialType(OmitType(CreateColumnDto, ['boardId'] as const)) {}
