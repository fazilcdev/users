import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { GqlBuildCondition } from 'selfpod-common/dist/common/snippets/gql-build-condition';
import { GqlFieldsmapPopulate } from 'selfpod-common/dist/common/snippets/gql-fieldsmap-populate';

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
  constructor(private readonly repos: RepositoryCollection) { }

  async execute(query: GetOneAppUserQuery): Promise<any> {
    let qry = this.repos.appUserModel.findOne(
      GqlBuildCondition(query.params.condition),
    );
    qry = GqlFieldsmapPopulate(qry, query.params.fieldsMap);

    return await qry.exec();
  }
}
