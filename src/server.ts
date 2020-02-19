import es from "event-stream";
import { EventEmitter } from "events";
import moment from "moment";
import { Edm, odata, ODataServer } from "odata-v4-server";

@odata.cors
@odata.namespace("Bot")
export class BotServer extends ODataServer {
  public static eventEmitter: EventEmitter = new EventEmitter();

  @Edm.ActionImport()
  public async start(): Promise<void> {
    const eventEmitter = BotServer.eventEmitter;

    setInterval(() => {
      eventEmitter.emit("time", moment().toISOString());
    }, 1000);
  }
}
