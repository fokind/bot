import { EventEmitter } from "events";
import { odata, ODataServer } from "odata-v4-server";
import { AccountController } from "./controller/Account";
import { AdvisorsController } from "./controller/Advisors";
import { BalanceController } from "./controller/Balance";
import { CandleController } from "./controller/Candle";
import { CandleImportController } from "./controller/CandleImport";
import { CandleSourceController } from "./controller/CandleSource";
import { CandleStreamController } from "./controller/CandleStream";
import { IndicatorController } from "./controller/Indicator";
import { IndicatorInputsController } from "./controller/IndicatorInputs";
import { IndicatorStreamInputController } from "./controller/IndicatorStreamInputs";
import { IndicatorStreamController } from "./controller/IndicatorStreams";
import { OrdersController } from "./controller/Orders";
import { SessionController } from "./controller/Session";
import { StrategiesController } from "./controller/Strategies";
import { TickerController } from "./controller/Ticker";
import { TickerSourceController } from "./controller/TickerSource";
import { TickerStreamController } from "./controller/TickerStream";
import { TradesController } from "./controller/Trades";

@odata.cors
@odata.namespace("Bot")
@odata.controller(AccountController, true)
@odata.controller(AdvisorsController, true)
@odata.controller(BalanceController, true)
@odata.controller(CandleController, true)
@odata.controller(CandleImportController, true)
@odata.controller(CandleSourceController, true)
@odata.controller(CandleStreamController, true)
@odata.controller(IndicatorController, true)
@odata.controller(IndicatorInputsController, true)
@odata.controller(IndicatorStreamInputController, true)
@odata.controller(IndicatorStreamController, true)
@odata.controller(SessionController, true)
@odata.controller(StrategiesController, true)
@odata.controller(OrdersController, true)
@odata.controller(TickerController, true)
@odata.controller(TickerSourceController, true)
@odata.controller(TickerStreamController, true)
@odata.controller(TradesController, true)
export class BotServer extends ODataServer {
    public static eventBus = new EventEmitter();
}
