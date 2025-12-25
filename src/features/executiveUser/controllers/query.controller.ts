import { QueryBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { RPCServices } from 'selfpod-common/dist/services/rpc-services';
import { Users } from 'selfpod-common/dist/services/users/services';
import { GetOneExecutiveUserQuery } from '../queries/executiveUser/get-one-executiveUser.query';
import { GetManyExecutiveUserQuery } from '../queries/executiveUser/get-many-executiveUsers.query';
import { GetExecutiveUserCountQuery } from '../queries/executiveUser/get-executiveUser-count.query';

@Controller()
export class QueryController {
  constructor(private readonly queryBus: QueryBus) { }

  //   // ---------------------------------- Executive User ----------------------------------------------/

  @MessagePattern({ service: RPCServices.Users, cmd: Users.GetOneExecutiveUserQuery })
  async getOneExecutiveUser(query: any) {
    return await this.queryBus.execute(new GetOneExecutiveUserQuery(query)).catch(e => {
      throw new RpcException(e);
    });
  }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.GetManyExecutiveUserQuery })
  async getManyExecutiveUser(query: any) {
    return await this.queryBus
      .execute(new GetManyExecutiveUserQuery(query))
      .catch(e => {
        throw new RpcException(e);
      });
  }

  @MessagePattern({ service: RPCServices.Users, cmd: Users.GetExecutiveUserCountQuery })
  async getExecutiveUserCount(query: any) {
    return await this.queryBus
      .execute(new GetExecutiveUserCountQuery(query))
      .catch(e => {
        throw new RpcException(e);
      });
  }

}
