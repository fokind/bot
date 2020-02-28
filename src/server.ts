import { Edm, odata, ODataServer } from "odata-v4-server";
import { SessionController } from "./controller/Session";
import { EventEmitter } from "events";

@odata.cors
@odata.namespace("Bot")
@odata.controller(SessionController, true)
export class BotServer extends ODataServer {
    private static _eventBus: EventEmitter; 
    static public getEventBus() {
        if (!BotServer._eventBus) {
            BotServer._eventBus = new EventEmitter();
        }
        return BotServer._eventBus;
    }
    
    // можно подписаться
//   @Edm.ActionImport()
//   public async start(): Promise<string> {
//   }
}
