import { odata, ODataServer } from "odata-v4-server";
import { BacktestController } from "./controller/Backtest";
import { CandleImportController } from "./controller/CandleImport";

@odata.cors
@odata.namespace("Bot")
@odata.controller(BacktestController, true)
@odata.controller(CandleImportController, true)
export class BotServer extends ODataServer {}
