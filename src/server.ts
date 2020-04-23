import { EventEmitter } from "events";
import { odata, ODataServer } from "odata-v4-server";
import { AccountController } from "./controller/Account";
import { CandleController } from "./controller/Candle";
import { CandleSourceController } from "./controller/CandleSource";
import { SessionController } from "./controller/Session";
import { TickerController } from "./controller/Ticker";
import { TickerSourceController } from "./controller/TickerSource";

@odata.cors
@odata.namespace("Bot")
@odata.controller(AccountController, true)
@odata.controller(CandleController, true)
@odata.controller(CandleSourceController, true)
@odata.controller(SessionController, true)
@odata.controller(TickerController, true)
@odata.controller(TickerSourceController, true)
export class BotServer extends ODataServer {
    public static eventBus = new EventEmitter();
}
