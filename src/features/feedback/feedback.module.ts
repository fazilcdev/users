import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ALL_ENTITIES } from 'chatbuk-common/dist/services/entities';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

// MailerService is provided globally by MailerModule (configured in AppModule).
// Feedback is persisted to MongoDB so the admin dashboard can read it.
@Module({
  imports: [MongooseModule.forFeature([...ALL_ENTITIES])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
