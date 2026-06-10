import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Auth } from 'chatbuk-common/dist/services/auth/services';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { Mobileverification } from '../../models/mobileverification.model';
import { EncryptionService } from 'chatbuk-common/dist/features/encryption/encryption.service';

export class AppUserLoginCommand {
  constructor(readonly dto: any) { }
}

@CommandHandler(AppUserLoginCommand)
export class AppUserLoginHandler
  implements ICommandHandler<AppUserLoginCommand> {
  constructor(
    private readonly publisher: EventPublisher,
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
    private readonly encryptionService: EncryptionService
  ) { }

  async execute(command: AppUserLoginCommand): Promise<any> {
    const mb = await this.publisher.mergeObjectContext(
      new Mobileverification(this.repos),
    );
    const verified = await mb.verifyMobile(command.dto);
    if (!verified) throw new Error('invalid_otp')
    const state = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.LoginCommand,
      { ...command.dto, password: process.env.SECRET_PASS }
    );
    const customer = await this.repos.appUserModel.findOne({ authUser: state.authUser.id }).select('+encryptedDataKey');

    let userKey = null;
    if (customer && customer.encryptedDataKey) {
      userKey = this.encryptionService.decryptKey(customer.encryptedDataKey);
    }

    return { ...state, customer_code: customer.customer_code, userKey };
  }
}