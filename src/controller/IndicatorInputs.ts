import { Edm, odata, ODataController } from "odata-v4-server";
import { IndicatorInput } from "../model/IndicatorInput";

@odata.type(IndicatorInput)
@Edm.EntitySet("IndicatorInputs")
export class IndicatorInputsController extends ODataController {
    @odata.GET
    public async get(): Promise<IndicatorInput[]> {
        return [];
    }

    @odata.GET
    public async getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string,
        @odata.key period: number,
        @odata.key name: string,
        @odata.key options: string
    ): Promise<IndicatorInput> {
        return new IndicatorInput({
            exchange,
            currency,
            asset,
            period,
            name,
            options,
        });
    }
}
