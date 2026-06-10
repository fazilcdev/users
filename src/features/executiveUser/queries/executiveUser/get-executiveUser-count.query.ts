import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { RepositoryCollection } from "../../repositories";
import { GqlBuildCondition } from 'chatbuk-common/dist/common/snippets/gql-build-condition';

export class GetExecutiveUserCountQuery {
  constructor(
    readonly params: {
      condition?: any
    }
  ) { }
}

@QueryHandler(GetExecutiveUserCountQuery)
export class GetExecutiveUserCountHandler implements IQueryHandler<GetExecutiveUserCountQuery> {
  constructor(
    private readonly repos: RepositoryCollection
  ) { }

  async execute(query: GetExecutiveUserCountQuery): Promise<any> {
    let condition = Object.assign({}, query.params.condition, { deleted: false })
    let count = await this.repos.executiveUserModel.countDocuments(GqlBuildCondition(condition));

    return count.toString();
  }

}