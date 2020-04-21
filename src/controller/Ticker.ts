import { Edm, odata, ODataController } from "odata-v4-server";
import { Ticker } from "../model/Ticker";
import { TickerService } from "../service/TickerService";

@odata.type(Ticker)
@Edm.EntitySet("Ticker")
export class TickerController extends ODataController {
    @odata.GET
    public async get(): Promise<Ticker[]> {
        return [];
    }

    @odata.GET
    public async getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string
    ): Promise<Ticker> {
        const { ask, bid } = await TickerService.getTicker({
            exchange,
            currency,
            asset,
        });

        return new Ticker({
            exchange,
            currency,
            asset,
            ask,
            bid,
        });
    }
}
