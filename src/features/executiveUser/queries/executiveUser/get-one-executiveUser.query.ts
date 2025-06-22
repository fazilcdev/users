import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { GqlBuildCondition } from 'chatbuk-common/dist/common/snippets/gql-build-condition';
import { GqlFieldsmapPopulate } from 'chatbuk-common/dist/common/snippets/gql-fieldsmap-populate';

export class GetOneExecutiveUserQuery {
  constructor(
    readonly params: {
      condition?: any;
      projection?: any;
      fieldsMap?: any;
      limit?: number;
      sort?: any;
      skip: number;
    },
  ) {}
}

@QueryHandler(GetOneExecutiveUserQuery)
export class GetOneExecutiveUserHandler implements IQueryHandler<GetOneExecutiveUserQuery> {
  constructor(private readonly repos: RepositoryCollection) {}

  async execute(query: GetOneExecutiveUserQuery): Promise<any> {
    let qry = this.repos.executiveUserModel.findOne(
      GqlBuildCondition(query.params.condition),
    );
    qry = GqlFieldsmapPopulate(qry, query.params.fieldsMap);

    return await qry.exec();
  }
}
