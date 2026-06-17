import { Module, Global } from '@nestjs/common';
import { MongoDbModule } from 'chatbuk-common/dist/common/databases/mongo-db.modules';
import { NatsClientModule } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { appUserModule } from './features/appUser/appUser.module';
import { ExecutiveUserModule } from './features/executiveUser/executiveUser.module';
import { FeedbackModule } from './features/feedback/feedback.module';
import { InviteModule } from './features/invite/invite.module';
import { MailerModule } from '@nest-modules/mailer';
import { MongooseModule } from '@nestjs/mongoose';
// import { UsersModule } from './features/users/users.module';



@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: global['config'].MONGO_DB,
        socketTimeoutMS: 480000,
        autoIndex: global['config'].MONGO_DB_INDEX == 'true' ? true : false,
      }),
    }),
    NatsClientModule,
    appUserModule,
    ExecutiveUserModule,
    FeedbackModule,
    InviteModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: `${global['config'].SMTP_CONFIG}`,
        defaults: {
          from: '',
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
