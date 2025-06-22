import { CreateExecutiveUserHandler } from "./executiveUser/create-executiveUser.command";
import { DeleteExecutiveUserHandler } from "./executiveUser/delete-executiveUser.command";
import { ExecutiveUserLoginHandler } from "./executiveUser/login-executiveUser.command";
import { UpdateExecutiveUserRatingHandler } from "./executiveUser/update-executive-rating.command";
import { UpdateExecutiveUserImageHandler } from "./executiveUser/update-executiveUser-image.command";
import { UpdateExecutiveUserPasswordHandler } from "./executiveUser/update-executiveUser-password.command";
import { UpdateExecutiveUserHandler } from "./executiveUser/update-executiveUser.command";
import { UpdateExecutiveStatusHandler } from "./executiveUser/update-worker-status.command";


export const CommandHandlers = [
  //
  CreateExecutiveUserHandler,
  UpdateExecutiveUserHandler,
  UpdateExecutiveUserImageHandler,
  UpdateExecutiveUserPasswordHandler,
  DeleteExecutiveUserHandler,
  UpdateExecutiveUserRatingHandler,

  ExecutiveUserLoginHandler,
  UpdateExecutiveStatusHandler

];
