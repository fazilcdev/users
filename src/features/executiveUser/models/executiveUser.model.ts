import { AggregateRoot } from '@nestjs/cqrs';
import { flakeId } from 'chatbuk-common/dist/common/snippets/flake-idgen';
import { RepositoryCollection } from '../repositories';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Auth } from 'chatbuk-common/dist/services/auth/services';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { entityStateChangedEvent } from '../events/executiveUser.event';

export class ExecutiveUser extends AggregateRoot {
  id: string;
  repos: RepositoryCollection;
  nats: NatsClientService;

  constructor(repos, id?) {
    super();
    this.id = id;
    this.repos = repos;
  }

  async create(data: any, tokenUser: any) {
    // check if previous user with same username
    const prevUser = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.GetOneAuthUserQuery,
      {
        condition: { mobile: data.mobile },
        fieldsMap: {},
      },
    );
    if (prevUser) throw new Error('username_already_registered');

    let executive_code = await this.generateCustomerCode()

    const authUser = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.CreateAuthUserCommand,
      {
        fId: flakeId(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        roles: ['ExecutiveUser'],
      },
    );

    
    let d = Object.assign({}, data, { authUser: authUser.id,  
      executive_code, fId: flakeId(), status: data.status});
    const state = await this.repos.executiveUserModel.create(d);

    let auditLog = {
      command: 'CreateExecutiveUserCommand',
      entity: 'ExecutiveUser',
      action: 'Create',
      authUser: tokenUser.id,
      oldValue: null,
      newValue: state.toJSON()
    }
    this.applyEntityStateChangedEvent(auditLog)
    return state;
  }

  async updateRating(dto){
    let user = await this.repos.executiveUserModel.findOne({authUser: dto.authUser})
    return user
  }

  async update(data: any, tokenUser: any) {

    // const activities = await TwilioWorkspaceClient.activities.list({friendlyName: data.status})
    // if(!activities || activities.length < 1) throw 'Activity not found'

    let d: any = Object.assign({}, data);
    if (d.avatar) d = Object.assign({}, d, { $inc: { avatarVer: 1 } });
    const appUser = await this.repos.executiveUserModel.findByIdAndUpdate(data.id, d, {
      new: false,
    });


    let e = Object.assign({}, data, { id: appUser.authUser })
    
    const authUser = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.UpdateAuthUserCommand, e

    );
    let appUserJson = appUser.toJSON();

    let resp = Object.assign({}, appUserJson, { authUser: authUser });

    if(data['from'] == "event"){

    }else{
      try{
        const d  = {
         type: appUser.account_type,
         status: appUser.status,
         executiveCode: appUser.executive_code,
         executiveStatus: appUser.status,
         og2: 'update-executive'
       }
      }catch(e){
        console.log(e)
      }
    }
  
    resp = await this.repos.executiveUserModel.findById(data.id).populate('authUser');
    return resp;
  }

  async updateImage(file: any) {
    if (!file) throw new Error('file_not_found');
    const l = global['config'].PUBLIC_FOLDER.length;
    let path = file.path.substring(l);
    const resp = await this.repos.executiveUserModel.findByIdAndUpdate(
      this.id,
      { image: path },
      { new: true },
    );
    return resp;
  }

  async updateWorkerStatus(data){
    const resp = await this.repos.executiveUserModel.findOneAndUpdate(
        {executive_code: data.executiveCode},
        { status: data.status },
        { new: true },
      );   
     const state = await this.repos.executiveUserModel.findOne({executive_code: data.executiveCode})
     try{
       const d  = {
        type: state.account_type,
        status: data.status,
        executiveCode: state.executive_code,
        executiveStatus: data.status,
        og2: 'update-worker'
      }
     }catch(e){
       console.log(e)
     }
      
    return state;
  }

  async delete(tokenUser: any) {
    const resp = await this.repos.executiveUserModel.findById(this.id)
    await this.repos.executiveUserModel.deleteById(this.id);
    
    let state = await this.repos.executiveUserModel.findOneDeleted({ _id: this.id });
    // TwilioWorkspaceClient
    //              .workers(resp.workerSid)
    //              .remove();
    let auditLog = {
      command: 'DeleteExecutiveUserCommand',
      entity: 'ExecutiveUser',
      action: 'Delete',
      authUser: tokenUser.id,
      oldValue: state,
      newValue: null,
    };
    this.applyEntityStateChangedEvent(auditLog);
    return state;
  }

  async attach(data) {
    let resp = await this.repos.executiveUserModel.findByIdAndUpdate(
      this.id,
      { $addToSet: { branches: data } },
      { new: true },
    );
    return resp;
  }

  async updatePassword(dto) {

    let condition = { code: dto.code, mobileNo: dto.mobileNo };
    let user: any = await this.repos.mobileverificationModel.findOne(condition);
    if (!user) throw new Error('invalid_verification');

    let authUser = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.GetOneAuthUserQuery,
      { condition: { mobile: user.mobileNo } },
    );
    if (!authUser) throw new Error('user_doesnt_exist');
    let updatedPassword = await this.nats.sendSync(
      RPCServices.Auth,
      Auth.UpdatePasswordCommand,
      {
        id: authUser.id,
        password: dto.password,
      },
    );
    return updatedPassword;
  }

  async applyEntityStateChangedEvent(data) {
    this.apply(new entityStateChangedEvent(data))
  }

  async generateCustomerCode(){
    const prefix = "TEXE";
    const user = await this.repos.executiveUserModel.findOne().sort({_id: -1})
    var user_code_number = 1;
    if(user && user.executive_code){
      user_code_number = parseInt(user.executive_code.replace(prefix, '')) + 1
    }
    return prefix+Date.now()
    return prefix+user_code_number
  }
}
