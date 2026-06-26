import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST', 'localhost'),
      port: Number(this.config.get('MAIL_PORT', 1025)),
      secure: this.config.get('MAIL_SECURE') === 'true',
      auth: user ? { user, pass } : undefined,
    });

    this.from = this.config.get<string>(
      'MAIL_FROM',
      'Forte Contabilidade <nao-responder@fortecontabilidade.com.br>',
    );
  }

  /// Envia o e-mail de recuperação de senha com o link de redefinição.
  async sendPasswordReset(to: string, name: string, resetLink: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #171717;">
        <h2 style="color: #bf8500;">Forte Contabilidade</h2>
        <p>Olá, ${name}.</p>
        <p>Recebemos um pedido para redefinir a sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}"
             style="background: #e3a70a; color: #2a1d04; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size: 13px; color: #666;">
          Se você não solicitou isso, ignore este e-mail. O link expira em 1 hora.
        </p>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Recuperação de senha — Forte Contabilidade',
      html,
    });

    this.logger.log(`E-mail de recuperação enviado para ${to} (id: ${info.messageId})`);
  }
}
