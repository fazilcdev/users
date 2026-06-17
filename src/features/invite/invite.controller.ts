import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Users } from 'chatbuk-common/dist/services/users/services';
import { InviteService } from './invite.service';

@Controller()
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @MessagePattern({ service: RPCServices.Users, cmd: Users.SendInviteCommand })
  async sendInvite(dto: any) {
    return await this.inviteService.send(dto).catch((e) => {
      throw new RpcException(e.message);
    });
  }
}
