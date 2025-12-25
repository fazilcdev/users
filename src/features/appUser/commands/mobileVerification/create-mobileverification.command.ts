import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { Mobileverification } from '../../models/mobileverification.model';
import { NatsClientService } from 'selfpod-common/dist/common/rpc-clients/nats/nats-client.module';
import { MailerService } from '@nest-modules/mailer';
import { HttpService } from '@nestjs/axios';

export class CreateMobileverificationCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(CreateMobileverificationCommand)
export class CreateMobileverificationHandler
  implements ICommandHandler<CreateMobileverificationCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
    private readonly https: HttpService,
    private readonly mailerService: MailerService,
  ) { }

  async execute(command: CreateMobileverificationCommand): Promise<any> {
    const mb = await this.publisher.mergeObjectContext(
      new Mobileverification(this.repos, this.https),
    );
    mb.mailer = this.mailerService;
    mb.nats = this.nats;
    mb.https = this.https;
    const state = await mb.create(command.dto);
    mb.commit();
    return state;
  }
}
