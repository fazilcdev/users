import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { ModelPlus } from 'mongoose';
import { flakeId } from 'chatbuk-common/dist/common/snippets/flake-idgen';
import { IUsersFeedbackDoc } from 'chatbuk-common/dist/services/users/entities/feedback/feedback.interface';

export interface FeedbackDto {
  type?: string;
  message: string;
  email?: string;
  name?: string;
  userId?: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly mailer: MailerService,
    @InjectModel('UsersFeedback')
    private readonly feedbackModel: ModelPlus<IUsersFeedbackDoc>,
  ) {}

  async send(dto: FeedbackDto): Promise<{ ok: boolean }> {
    const message = (dto?.message || '').toString().trim();
    if (!message) {
      return { ok: false };
    }

    const type = (dto?.type || 'general').toString();

    // Persist first so feedback is never lost even if SMTP is down — the dashboard
    // reads from this collection.
    await this.feedbackModel
      .create({
        fId: flakeId(),
        type,
        message,
        email: dto?.email,
        name: dto?.name,
        userId: dto?.userId,
        status: 'new',
      })
      .catch((e) => {
        // Storage failure shouldn't block the email path; log and continue.
        this.logger.error(`Failed to persist feedback: ${e?.message}`);
      });

    // Recipient / sender come from config so they can change per environment.
    const supportEmail = global['config']?.SUPPORT_EMAIL || 'hello@chatbuk.com';
    const from = global['config']?.SMTP_FROM || supportEmail;
    const fromUser = `${dto?.name || 'A chatbuk user'}${dto?.email ? ` <${dto.email}>` : ''}`;

    await this.mailer
      .sendMail({
        to: supportEmail,
        from,
        // Let support reply straight to the user.
        replyTo: dto?.email || undefined,
        subject: `chatbuk ${type} feedback`,
        text: `Type: ${type}\nFrom: ${fromUser}\n\n${message}\n`,
      })
      .catch((e) => {
        // Already persisted above, so a mail failure is non-fatal.
        this.logger.error(`Failed to email feedback: ${e?.message}`);
      });

    this.logger.log(`Feedback (${type}) stored and emailed to ${supportEmail}`);
    return { ok: true };
  }

  async getMany(params: {
    condition?: any;
    limit?: number;
    skip?: number;
    sort?: any;
  }): Promise<any[]> {
    return await this.feedbackModel
      .find(params?.condition || {})
      .sort(params?.sort || { createdAt: -1 })
      .skip(params?.skip || 0)
      .limit(params?.limit || 50)
      .exec();
  }

  async getCount(params: { condition?: any }): Promise<number> {
    return await this.feedbackModel.countDocuments(params?.condition || {});
  }

  async updateStatus(dto: { id: string; status: string }): Promise<any> {
    if (!dto?.id) throw new Error('feedback_id_required');
    return await this.feedbackModel
      .findByIdAndUpdate(dto.id, { status: dto.status }, { new: true })
      .exec();
  }
}
