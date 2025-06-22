import { GetExecutiveUserCountHandler } from "./get-executiveUser-count.query";
import { GetManyExecutiveUserHandler } from "./get-many-executiveUsers.query";
import { GetOneExecutiveUserHandler } from "./get-one-executiveUser.query";


export const QueryHandlers = [
 
  GetManyExecutiveUserHandler,
  GetOneExecutiveUserHandler,
  GetExecutiveUserCountHandler
]

