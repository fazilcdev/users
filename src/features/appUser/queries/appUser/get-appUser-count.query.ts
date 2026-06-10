import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { RepositoryCollection } from "../../repositories";
import { GqlBuildCondition } from 'chatbuk-common/dist/common/snippets/gql-build-condition';

export class GetAppUserCountQuery {
  constructor(
    readonly params: {
      condition?: any
      date?: any
    }
  ) { }
}

@QueryHandler(GetAppUserCountQuery)
export class GetAppUserCountHandler implements IQueryHandler<GetAppUserCountQuery> {
  constructor(
    private readonly repos: RepositoryCollection
  ) { }

  async execute(query: GetAppUserCountQuery): Promise<any> {
    //{ createdAt: query.params.date }
    let condition = Object.assign({}, query.params.condition, { deleted: false }) //
    let count = await this.repos.appUserModel.countDocuments(GqlBuildCondition(condition));
    return count.toString();
  }

}