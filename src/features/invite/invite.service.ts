import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

export interface InviteDto {
  email: string;
  inviterName?: string;
  inviterEmail?: string;
}

const isEmail = (v?: string) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(private readonly mailer: MailerService) {}

  async send(dto: InviteDto): Promise<{ ok: boolean }> {
    const to = (dto?.email || '').trim();
    if (!isEmail(to)) {
      return { ok: false };
    }

    const from = global['config']?.SMTP_FROM || global['config']?.SUPPORT_EMAIL || 'hello@chatbuk.com';
    const appUrl = global['config']?.WEB_APP_URL || global['config']?.APP_URL || 'https://app.chatbuk.com';
    const inviter = (dto?.inviterName || '').trim();

    await this.mailer.sendMail({
      to,
      from,
      replyTo: dto?.inviterEmail || undefined,
      subject: inviter ? `${inviter} invited you to chatbuk` : 'You’re invited to chatbuk',
      html: this.buildHtml({ appUrl, inviter }),
      text: this.buildText({ appUrl, inviter }),
    });

    this.logger.log(`Invite emailed to ${to}`);
    return { ok: true };
  }

  private buildText({ appUrl, inviter }: { appUrl: string; inviter: string }) {
    const lead = inviter ? `${inviter} thinks you'll love chatbuk.` : `You're invited to chatbuk.`;
    return [
      lead,
      '',
      'Optimise your finance and personal life with personalised AI agents that track your spending, habits, records and more — all in one private chat.',
      '',
      `Join here: ${appUrl}`,
    ].join('\n');
  }

  private buildHtml({ appUrl, inviter }: { appUrl: string; inviter: string }) {
    const lead = inviter
      ? `<strong>${escapeHtml(inviter)}</strong> thinks you’ll love chatbuk.`
      : `You’ve been invited to chatbuk.`;

    return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px;">
                <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#0a0a0a;">chatbuk</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0a0a0a;">You’re invited to chatbuk</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">${lead}</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
                  Optimise your <strong>finance</strong> and personal life with personalised AI agents that track your
                  spending, habits, records and more — all in one private chat.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;">
                <a href="${appUrl}" target="_blank"
                   style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:9999px;">
                  Join chatbuk
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                  If the button doesn’t work, copy and paste this link into your browser:<br/>
                  <a href="${appUrl}" target="_blank" style="color:#71717a;">${appUrl}</a>
                </p>
              </td>
            </tr>
          </table>
          <p style="max-width:480px;margin:16px auto 0;font-size:11px;color:#a1a1aa;text-align:center;">
            You received this because someone invited you to chatbuk. You can ignore this email if you’re not interested.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}
