import { ModelPlus } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { IUsersAppUserDoc } from 'selfpod-common/dist/services/users/entities/appUser/appUser.interface';
import { IUsersExecutiveUserDoc } from 'selfpod-common/dist/services/users/entities/executiveUser/executiveUser.interface';
import { IUsersMobileVerificationDoc } from 'selfpod-common/dist/services/users/entities/mobileVerification/mobileVerification.interface';

export class RepositoryCollection {
  constructor(
    //

    @InjectModel('UsersAppUser')
    public readonly appUserModel: ModelPlus<IUsersAppUserDoc>,

    @InjectModel('UsersExecutiveUser')
    public readonly executiveUserModel: ModelPlus<IUsersExecutiveUserDoc>,


    @InjectModel('UsersMobileVerification')
    public readonly mobileverificationModel: ModelPlus<
      IUsersMobileVerificationDoc
    >,
  ) { }
}
