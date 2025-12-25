import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { NatsClientService } from 'selfpod-common/dist/common/rpc-clients/nats/nats-client.module';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class UpdateExecutiveUserCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(UpdateExecutiveUserCommand)
export class UpdateExecutiveUserHandler implements ICommandHandler<UpdateExecutiveUserCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
  ) { }

  async execute(command: UpdateExecutiveUserCommand): Promise<any> {
    const user = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos, command.dto.data.id),
    );
    user.nats = this.nats;
    const state = await user.update(command.dto.data, command.dto.tokenUser);
    user.commit();
    return state;
  }
}
