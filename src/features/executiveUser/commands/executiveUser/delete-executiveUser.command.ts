import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class DeleteExecutiveUserCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(DeleteExecutiveUserCommand)
export class DeleteExecutiveUserHandler implements ICommandHandler<DeleteExecutiveUserCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
  ) { }

  async execute(command: DeleteExecutiveUserCommand): Promise<any> {
    const user = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos, command.dto.data.id),
    );
    const state = await user.delete(command.dto.tokenUser);
    user.commit();
    return state;
  }
}
