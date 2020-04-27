import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { CandleService } from "../service/CandleService";
import { EventBus } from "../service/EventBus";

export class CandleSource {
    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    @Edm.Key
    @Edm.Double
    public period: number;

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async update(@odata.result result: any, @odata.body body: any) {
        const { exchange, currency, asset, period } = result;
        const { begin, end } = body;

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
            await collection.findOneAndUpdate(
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

    @Edm.Action
    public subscribe(@odata.result result: any) {
        const { exchange, currency, asset, period } = result;

        EventBus.onCandle((candle) => {
            console.log(candle); // UNDONE пока просто пример использования
        });

        CandleService.subscribe({
            exchange,
            currency,
            asset,
            period,
        });
    }

    @Edm.Action
    public async unsubscribe(@odata.result result: any): Promise<void> {
        const { exchange, currency, asset, period } = result;

        return CandleService.unsubscribe({
            exchange,
            currency,
            asset,
            period,
        });
    }
}
