import { CommandBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Users } from 'chatbuk-common/dist/services/users/services';
import { CreateExecutiveUserCommand } from '../commands/executiveUser/create-executiveUser.command';
import { UpdateExecutiveUserCommand } from '../commands/executiveUser/update-executiveUser.command';
import { DeleteExecutiveUserCommand } from '../commands/executiveUser/delete-executiveUser.command';
import { UpdateExecutiveUserPasswordCommand } from '../commands/executiveUser/update-executiveUser-password.command';
import { ExecutiveUserLoginCommand } from '../commands/executiveUser/login-executiveUser.command';
import { UpdateExecutiveStatusCommand } from '../commands/executiveUser/update-worker-status.command';
import { UpdateExecutiveUserRatingCommand, UpdateExecutiveUserRatingHandler } from '../commands/executiveUser/update-executive-rating.command';

@Controller()
export class CommandController {
  constructor(private readonly commandBus: CommandBus) { }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.CreateExecutiveUserCommand })
  async createExecutiveUser(dto: any) {
    return await this.commandBus
      .execute(new CreateExecutiveUserCommand(dto))
      .catch(e => {
        switch (e.message) {
          case 'username_already_registered':
            throw new RpcException(e.message);
          default:
            throw new RpcException(e.message);
        }
      });
  }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.LoginExecutiveUserCommand })
  async loginExecutiveUser(dto: any) {
    return await this.commandBus
      .execute(new ExecutiveUserLoginCommand(dto))
      .catch(e => {
        switch (e.message) {
          case 'username_already_registered':
            throw new RpcException('username_already_registered');
          case 'invalid_otp':
            throw new RpcException('invalid_otp');
          default:
            throw new RpcException('unknow_error');
        }
      });
  }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.UpdateExecutiveUserCommand })
  async updateExecutiveUser(dto: any) {
    return await this.commandBus
      .execute(new UpdateExecutiveUserCommand(dto))
      .catch(e => {
        throw new RpcException(e.message);
      });
  }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.UpdateExecuticeStatusCommand })
  async updateExecutiveStatus(dto: any) {
    return await this.commandBus
      .execute(new UpdateExecutiveStatusCommand(dto))
      .catch(e => {
        throw new RpcException(e.message);
      });
  }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.UpdateExecutiveUserRatingCommand })
  async updateExecutiveRating(dto: any) {
    return await this.commandBus
      .execute(new UpdateExecutiveUserRatingCommand(dto))
      .catch(e => {
        throw new RpcException(e.message);
      });
  }


  @MessagePattern({ service: RPCServices.Users, cmd: Users.DeleteExecutiveUserCommand })
  async deleteAppUser(dto: any) {
    return await this.commandBus
      .execute(new DeleteExecutiveUserCommand(dto))
      .catch(e => {
        throw new RpcException(e.message);
      });
  }

  @MessagePattern({
    service: RPCServices.Users,
    cmd: Users.UpdateExecutiveUserPasswordCommand,
  })
  async updateExecutiveUserPassword(dto: any) {
    return await this.commandBus
      .execute(new UpdateExecutiveUserPasswordCommand(dto))
      .catch(e => {
        switch (e.message) {
          case 'invalid_verification':
            throw new RpcException(e.message);
          case 'user_doesnt_exist':
            throw new RpcException(e.message);
          default:
            throw new RpcException(e.message);
        }
      });
  }
}
