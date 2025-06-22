import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { AddImageDto } from '../../dtos/add-image-dto';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class UpdateExecutiveUserRatingCommand {
  constructor(readonly dto: any) {}
}

@CommandHandler(UpdateExecutiveUserRatingCommand)
export class UpdateExecutiveUserRatingHandler
  implements ICommandHandler<UpdateExecutiveUserRatingCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
  ) {}

  async execute(command: UpdateExecutiveUserRatingCommand): Promise<any> {
    let ad = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos, command.dto.id),
    );
    let state = ad.updateRating(command.dto);
    ad.commit();
    return state;
  }
}
