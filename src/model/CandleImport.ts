import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { CandleService } from "../service/CandleService";

export class CandleImport {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public exchange: string;

    @Edm.String
    public currency: string;

    @Edm.String
    public asset: string;

    @Edm.Double
    public period: number;

    @Edm.String
    public begin: string;

    @Edm.String
    public end: string;

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async execute(
        @odata.result
        result: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
            begin: string;
            end: string;
        }
    ) {
        const { exchange, currency, asset, period, begin, end } = result;
        const collection = (await connect()).collection("candle");
        (
            await CandleService.getCandles({
                exchange,
                currency,
                asset,
                period,
                begin,
                end,
            })
        ).forEach(async (candle) => {
            await (await connect()).collection("candle").findOneAndUpdate(
                {
                    exchange,
                    currency,
                    asset,
                    period,
                    time: candle.time,
                },
                { $set: candle },
                { upsert: true }
            );
        });
    }
}
