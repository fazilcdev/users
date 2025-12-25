import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { RPCServices } from 'selfpod-common/dist/services/rpc-services';
import { Auth } from 'selfpod-common/dist/services/auth/services';
import { NatsClientService } from 'selfpod-common/dist/common/rpc-clients/nats/nats-client.module';
import { ExecutiveStatus } from 'selfpod-common/dist/common/utils/constants';
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
    await user.updateWorkerStatus({ status: ExecutiveStatus.AVAILABLE, executiveCode: executive.executive_code });
    return { ...state, executive_code: executive.executive_code };
  }
}