import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /// Valida e-mail + senha (usado pelo LocalStrategy).
  async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) return null;

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return null;

    return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active };
  }

  /// Gera o JWT a partir do usuário autenticado.
  async login(user: AuthenticatedUser) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  /// Inicia o fluxo de recuperação de senha. Resposta neutra (evita enumerar e-mails).
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      await this.prisma.passwordResetToken.create({
        data: { tokenHash: sha256(rawToken), userId: user.id, expiresAt },
      });

      const appUrl = this.config.get<string>('APP_URL', 'http://localhost:5173');
      const resetLink = `${appUrl}/reset-password?token=${rawToken}`;
      await this.mailService.sendPasswordReset(user.email, user.name, resetLink);
    }

    return { message: 'Se o e-mail existir, enviaremos instruções de recuperação.' };
  }

  /// Conclui a redefinição de senha a partir do token.
  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(token) },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
