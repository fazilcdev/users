import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Auth } from 'chatbuk-common/dist/services/auth/services';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { ExecutiveStatus } from 'chatbuk-common/dist/common/utils/constants';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class ExecutiveUserLoginCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(ExecutiveUserLoginCommand)
export class ExecutiveUserLoginHandler
  implements ICommandHandler<ExecutiveUserLoginCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
  ) { }

  async execute(command: ExecutiveUserLoginCommand): Promise<any> {
    const user = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos),
    );
    user.nats = this.nats
    const state = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.LoginCommand,
      { ...command.dto }
    );
    var executive = await this.repos.executiveUserModel.findOne({ authUser: state.authUser.id })
    return { ...state, executive_code: executive.executive_code };
  }
}