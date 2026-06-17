import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

export interface FeedbackDto {
  type?: string;
  message: string;
  email?: string;
  name?: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private readonly mailer: MailerService) {}

  async send(dto: FeedbackDto): Promise<{ ok: boolean }> {
    const message = (dto?.message || '').toString().trim();
    if (!message) {
      return { ok: false };
    }

    // Recipient / sender come from config so they can change per environment.
    const supportEmail = global['config']?.SUPPORT_EMAIL || 'hello@chatbuk.com';
    const from = global['config']?.SMTP_FROM || supportEmail;
    const type = (dto?.type || 'general').toString();
    const fromUser = `${dto?.name || 'A chatbuk user'}${dto?.email ? ` <${dto.email}>` : ''}`;

    await this.mailer.sendMail({
      to: supportEmail,
      from,
      // Let support reply straight to the user.
      replyTo: dto?.email || undefined,
      subject: `chatbuk ${type} feedback`,
      text: `Type: ${type}\nFrom: ${fromUser}\n\n${message}\n`,
    });

    this.logger.log(`Feedback (${type}) emailed to ${supportEmail}`);
    return { ok: true };
  }
}
