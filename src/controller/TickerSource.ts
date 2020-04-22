import { Edm, odata, ODataController } from "odata-v4-server";
import { TickerSource } from "../model/TickerSource";

@odata.type(TickerSource)
@Edm.EntitySet("TickerSource")
export class TickerSourceController extends ODataController {
    @odata.GET
    public async get(): Promise<TickerSource[]> {
        return [];
    }

    @odata.GET
    public async getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string
    ): Promise<TickerSource> {
        return new TickerSource({
            exchange,
            currency,
            asset,
        });
    }
}
