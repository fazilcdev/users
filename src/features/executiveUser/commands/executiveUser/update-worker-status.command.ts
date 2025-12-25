import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { NatsClientService } from 'selfpod-common/dist/common/rpc-clients/nats/nats-client.module';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class UpdateExecutiveStatusCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(UpdateExecutiveStatusCommand)
export class UpdateExecutiveStatusHandler implements ICommandHandler<UpdateExecutiveStatusCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
  ) { }

  async execute(command: UpdateExecutiveStatusCommand): Promise<any> {
    const user = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos, command.dto.data.id),
    );
    user.nats = this.nats;
    const state = await user.updateWorkerStatus(command.dto.data);
    user.commit();
    return state;
  }
}
