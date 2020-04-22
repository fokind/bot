import { Edm, odata, ODataController } from "odata-v4-server";
import { CandleSource } from "../model/CandleSource";

@odata.type(CandleSource)
@Edm.EntitySet("CandleSource")
export class CandleSourceController extends ODataController {
    @odata.GET
    public async get(): Promise<CandleSource[]> {
        return [];
    }

    @odata.GET
    public async getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string,
        @odata.key period: number
    ): Promise<CandleSource> {
        return new CandleSource({
            exchange,
            currency,
            asset,
            period,
        });
    }
}
