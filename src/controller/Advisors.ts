import { Edm, odata, ODataController } from "odata-v4-server";
import { Advisor } from "../model/Advisor";

@odata.type(Advisor)
@Edm.EntitySet("Advisors")
export class AdvisorsController extends ODataController {
    @odata.GET
    public async get(): Promise<Advisor[]> {
        return [];
    }

    @odata.GET
    public async getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string,
        @odata.key period: number,
        @odata.key strategyCodeId: string,
    ): Promise<Advisor> {
        return new Advisor({
            exchange,
            currency,
            asset,
            period,
            strategyCodeId
        });
    }
}
