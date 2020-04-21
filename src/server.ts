import { EventEmitter } from "events";
import { odata, ODataServer } from "odata-v4-server";
import { CandleController } from "./controller/Candle";
import { SessionController } from "./controller/Session";
import { TickerController } from "./controller/Ticker";

@odata.cors
@odata.namespace("Bot")
@odata.controller(CandleController, true)
@odata.controller(SessionController, true)
@odata.controller(TickerController, true)
export class BotServer extends ODataServer {
  public static eventBus = new EventEmitter();
}
