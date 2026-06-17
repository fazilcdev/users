import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Users } from 'chatbuk-common/dist/services/users/services';
import { FeedbackService } from './feedback.service';

@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @MessagePattern({ service: RPCServices.Users, cmd: Users.SendFeedbackCommand })
  async sendFeedback(dto: any) {
    return await this.feedbackService.send(dto).catch((e) => {
      throw new RpcException(e.message);
    });
  }
}
