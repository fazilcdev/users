import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { AddImageDto } from '../../dtos/add-image-dto';
import { ExecutiveUser } from '../../models/executiveUser.model';

export class UpdateExecutiveUserImageCommand {
  constructor(readonly dto: AddImageDto, readonly file: any) {}
}

@CommandHandler(UpdateExecutiveUserImageCommand)
export class UpdateExecutiveUserImageHandler
  implements ICommandHandler<UpdateExecutiveUserImageCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
  ) {}

  async execute(command: UpdateExecutiveUserImageCommand): Promise<any> {
    let ad = await this.publisher.mergeObjectContext(
      new ExecutiveUser(this.repos, command.dto.id),
    );
    let state = ad.updateImage(command.file);
    ad.commit();
    return state;
  }
}
