import { EventEmitter } from "events";
import { odata, ODataServer } from "odata-v4-server";
import { SessionController } from "./controller/Session";

@odata.cors
@odata.namespace("Bot")
@odata.controller(SessionController, true)
export class BotServer extends ODataServer {
  public static eventBus = new EventEmitter();
}
