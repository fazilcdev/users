import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { GqlBuildCondition } from 'chatbuk-common/dist/common/snippets/gql-build-condition';
import { GqlFieldsmapPopulate } from 'chatbuk-common/dist/common/snippets/gql-fieldsmap-populate';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Auth } from 'chatbuk-common/dist/services/auth/services';

export class GetOneAppUserQuery {
  constructor(
    readonly params: {
      condition?: any;
      projection?: any;
      fieldsMap?: any;
      limit?: number;
      sort?: any;
      skip: number;
    },
  ) { }
}

@QueryHandler(GetOneAppUserQuery)
export class GetOneAppUserHandler implements IQueryHandler<GetOneAppUserQuery> {
  constructor(
    private readonly repos: RepositoryCollection,
    private readonly nats: NatsClientService,
  ) { }

  async execute(query: GetOneAppUserQuery): Promise<any> {
    let condition = { ...(query.params.condition || {}) };
    let customerQueryFound = false;
    let customerQuery = {};

    if (condition && condition.hasOwnProperty('email')) {
      customerQueryFound = true;
      customerQuery = { email: condition.email };
      delete condition.email;
    }
    if (condition && condition.hasOwnProperty('mobile')) {
      customerQueryFound = true;
      customerQuery = { ...customerQuery, mobile: condition.mobile };
      delete condition.mobile;
    }
    if (condition && condition.hasOwnProperty('customer')) {
      customerQueryFound = true;
      customerQuery = { ...customerQuery, firstName: condition.customer };
      delete condition.customer;
    }

    if (customerQueryFound) {
      const user = await this.nats.sendSync(
        RPCServices.Auth,
        Auth.GetOneAuthUserQuery,
        {
          condition: customerQuery,
          fieldsMap: {},
        },
      );
      if (!user) return null;
      condition = { ...condition, authUser: user.id };
    }

    let qry = this.repos.appUserModel.findOne(
      GqlBuildCondition(condition),
    );
    qry = GqlFieldsmapPopulate(qry, query.params.fieldsMap);

    return await qry.exec();
  }
}
