import { ModelPlus } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUsersExecutiveUserDoc } from 'chatbuk-common/dist/services/users/entities/executiveUser/executiveUser.interface';
import { IUsersMobileVerificationDoc } from 'chatbuk-common/dist/services/users/entities/mobileVerification/mobileVerification.interface';

export class RepositoryCollection {
  constructor(
    //


    @InjectModel('UsersExecutiveUser')
    public readonly executiveUserModel: ModelPlus<IUsersExecutiveUserDoc>,

    @InjectModel('UsersMobileVerification')
    public readonly mobileverificationModel: ModelPlus<
      IUsersMobileVerificationDoc
    >,


    //  @InjectModel('UsersMobileVerification')
    // public readonly mobileverificationModel: ModelPlus<
    //   IUsersMobileVerificationDoc
    // >,
  ) { }
}
