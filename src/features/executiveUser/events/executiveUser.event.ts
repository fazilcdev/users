import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NatsClientService } from "selfpod-common/dist/common/rpc-clients/nats/nats-client.module";
import { RPCServices } from "selfpod-common/dist/services/rpc-services";
import { Auditlog } from 'selfpod-common/dist/services/auditlog/services'

export class entityStateChangedEvent {
  constructor(
    readonly dto: any
  ) { }
}

@EventsHandler(entityStateChangedEvent)
export class entityStateChangedEventHandler implements IEventHandler<entityStateChangedEvent> {

  constructor(
    readonly nats: NatsClientService
  ) { }


  async handle(event: entityStateChangedEvent) {
    await this.nats.publish(RPCServices.Auditlog, Auditlog.UserLogChangedEvent, event.dto)
  }

}