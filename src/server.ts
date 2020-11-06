import { odata, ODataServer } from "odata-v4-server";
import { BacktestController } from "./controller/Backtest";
import { CandleImportController } from "./controller/CandleImport";
import { IdealBacktestController } from "./controller/IdealBacktest";

@odata.cors
@odata.namespace("Bot")
@odata.controller(BacktestController, true)
@odata.controller(CandleImportController, true)
@odata.controller(IdealBacktestController, true)
export class BotServer extends ODataServer {}
