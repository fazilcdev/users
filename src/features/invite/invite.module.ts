import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

// MailerService is provided globally by MailerModule (configured in AppModule).
@Module({
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
