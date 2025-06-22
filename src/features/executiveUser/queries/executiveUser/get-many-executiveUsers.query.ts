import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RepositoryCollection } from '../../repositories';
import { GqlBuildCondition } from 'chatbuk-common/dist/common/snippets/gql-build-condition';
import { GqlBuildSort } from 'chatbuk-common/dist/common/snippets/gql-build-sort';
import { GqlFieldsmapPopulate } from 'chatbuk-common/dist/common/snippets/gql-fieldsmap-populate';

export class GetManyExecutiveUserQuery {
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

@QueryHandler(GetManyExecutiveUserQuery)
export class GetManyExecutiveUserHandler implements IQueryHandler<GetManyExecutiveUserQuery> {
  constructor(private readonly repos: RepositoryCollection) { }

  async execute(query: GetManyExecutiveUserQuery): Promise<any> {

    let qry = this.repos.executiveUserModel
      .find(GqlBuildCondition(query.params.condition))
      .limit(query.params.limit)
      .skip(query.params.skip)
      .sort(GqlBuildSort(query.params.sort));
    qry = GqlFieldsmapPopulate(qry, query.params.fieldsMap);
    let d = await qry.exec();
    return d;
  }
}
