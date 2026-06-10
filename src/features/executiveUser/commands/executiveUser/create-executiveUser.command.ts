import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class CreateExecutiveUserCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(CreateExecutiveUserCommand)
export class CreateExecutiveUserHandler implements ICommandHandler<CreateExecutiveUserCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
  ) { }

  async execute(command: CreateExecutiveUserCommand): Promise<any> {
    const user = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos),
    );
    user.nats = this.nats;
    const state = await user.create(command.dto.data, command.dto.tokenUser);
    user.commit();
    return state;
  }
}
