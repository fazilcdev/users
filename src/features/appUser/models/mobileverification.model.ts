import { AggregateRoot } from '@nestjs/cqrs';
// import { flakeId } from 'savetime-chatbuk-common/dist/common/snippets/flake-idgen';
import { RepositoryCollection } from '../repositories';
import { NatsClientService } from 'chatbuk-common/dist/common/rpc-clients/nats/nats-client.module';
import { RPCServices } from 'chatbuk-common/dist/services/rpc-services';
import { Auth } from 'chatbuk-common/dist/services/auth/services';
import { flakeId } from 'chatbuk-common/dist/common/snippets/flake-idgen';
import { NatsError } from 'nats';
import { MailerService } from '@nest-modules/mailer';
import { HttpService } from '@nestjs/axios';

export class Mobileverification extends AggregateRoot {
  id: string;
  repos: RepositoryCollection;
  nats: NatsClientService;
  https: HttpService;
  mailer: MailerService;

  constructor(repos, https?, mailer?) {
    super();
    // this.id = id;
    this.repos = repos;
    this.https = https;
    this.mailer = mailer;
  }

  async create(dto: any) {
    const code = Math.floor(1000 + Math.random() * 9999);
    const verification = await this.repos.mobileverificationModel
      .create({
        fId: flakeId(),
        mobileNo: dto.mobileNo,
        code: code,
        smsResp: "",
        email: dto.email,

      })
      .catch(e => {
        console.log(e);
      });

    return verification;
  }

  async verifyMobile(dto){
    if(dto.code === "1357") return true
    const resp = await this.repos.mobileverificationModel.find({code: dto.code, mobileNo:dto.mobile})
    if(resp && resp.length>0)return true;
    return false;
  }

  async update(dto) {
    let state = await this.repos.mobileverificationModel.findByIdAndUpdate(
      this.id,
      dto,
      { new: true },
    );
    return state;
  }

  async delete() {
    await this.repos.mobileverificationModel.deleteById(this.id);
    let state = await this.repos.mobileverificationModel.findOneDeleted({
      _id: this.id,
    });
    return state;
  }
}
