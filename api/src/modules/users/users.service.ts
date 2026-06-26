import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/// Campos públicos do usuário (NUNCA expõe passwordHash).
const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  active: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const { password, ...rest } = dto;
    await this.ensureEmailAvailable(dto.email);

    return this.prisma.user.create({
      data: { ...rest, passwordHash: await bcrypt.hash(password, 10) },
      select: userSafeSelect,
    });
  }

  /// Lista usuários ativos (não excluídos).
  findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: userSafeSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userSafeSelect,
    });
    if (!user) throw new NotFoundException(`Usuário ${id} não encontrado`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const { password, email, ...rest } = dto;

    if (email) await this.ensureEmailAvailable(email, id);

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(email ? { email } : {}),
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
      select: userSafeSelect,
    });
  }

  /// Altera apenas o papel do usuário.
  async updateRole(id: string, role: Role) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: { role }, select: userSafeSelect });
  }

  /// Soft delete: marca deletedAt e desativa. Impede remover o próprio usuário.
  async softDelete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('Você não pode excluir o próprio usuário');
    }
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
      select: userSafeSelect,
    });
  }

  // ─── Métodos usados pela autenticação ────────────────────────────────

  findActiveById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null, active: true },
      select: userSafeSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: userSafeSelect,
    });
  }

  /// Inclui o passwordHash — uso interno (validação de login).
  findByEmailWithPassword(email: string) {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  private async ensureEmailAvailable(email: string, ignoreId?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }
  }
}
