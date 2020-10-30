import { odata, ODataServer } from "odata-v4-server";
import { BacktestController } from "./controller/Backtest";
import { CandleImportController } from "./controller/CandleImport";
import { RoundtripController } from "./controller/Roundtrip";

@odata.cors
@odata.namespace("Bot")
@odata.controller(BacktestController, true)
@odata.controller(CandleImportController, true)
@odata.controller(RoundtripController, true)
export class BotServer extends ODataServer {}
