import { EventEmitter } from "events";
import { odata, ODataServer } from "odata-v4-server";
import { AccountController } from "./controller/Account";
import { BalanceController } from "./controller/Balance";
import { CandleController } from "./controller/Candle";
import { CandleSourceController } from "./controller/CandleSource";
import { OrdersController } from "./controller/Orders";
import { SessionController } from "./controller/Session";
import { TickerController } from "./controller/Ticker";
import { TickerSourceController } from "./controller/TickerSource";
import { TradesController } from "./controller/Trades";

@odata.cors
@odata.namespace("Bot")
@odata.controller(AccountController, true)
@odata.controller(BalanceController, true)
@odata.controller(CandleController, true)
@odata.controller(CandleSourceController, true)
@odata.controller(SessionController, true)
@odata.controller(OrdersController, true)
@odata.controller(TickerController, true)
@odata.controller(TickerSourceController, true)
@odata.controller(TradesController, true)
export class BotServer extends ODataServer {
    public static eventBus = new EventEmitter();
}
