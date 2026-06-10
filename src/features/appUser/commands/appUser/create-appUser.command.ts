import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { AppUser } from '../../models/appUser.model';

export class CreateAppUserCommand {
  constructor(readonly dto: any) { }
}

import { EncryptionService } from 'chatbuk-common/dist/features/encryption/encryption.service';

@CommandHandler(CreateAppUserCommand)
export class CreateAppUserHandler implements ICommandHandler<CreateAppUserCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
    private readonly encryptionService: EncryptionService,
  ) { }

  async execute(command: CreateAppUserCommand): Promise<any> {
    const appUser = await this.publisher.mergeObjectContext(
      new AppUser(this.repos),
    );
    appUser.nats = this.nats;

    // Generate and Encrypt Per-User Key
    const userKey = this.encryptionService.generateUserKey();
    const encryptedDataKey = this.encryptionService.encryptKey(userKey);

    const payload = {
      ...command.dto,
      encryptedDataKey
    };

    const state = await appUser.create(payload);
    appUser.commit();
    return state;
  }
}
