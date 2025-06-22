import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
// import { AppUser } from '../../models/appUser.model';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class UpdateExecutiveUserPasswordCommand {
  constructor(readonly data: any) {}
}

@CommandHandler(UpdateExecutiveUserPasswordCommand)
export class UpdateExecutiveUserPasswordHandler
  implements ICommandHandler<UpdateExecutiveUserPasswordCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
  ) {}

  async execute(command: UpdateExecutiveUserPasswordCommand): Promise<any> {
    let u = await this.publisher.mergeObjectContext(new ExecutiveUser(this.repos));
    u.nats = this.nats;
    let state = await u.updatePassword(command.data);
    u.commit();
    return state;
  }
}
