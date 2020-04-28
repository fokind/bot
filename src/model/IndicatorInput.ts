import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { IndicatorService } from "../service/IndicatorService";
import { Candle } from "./Candle";

export class IndicatorInput {
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

    @Edm.Key
    @Edm.String
    public name: string; // из фиксированного списка tulind

    @Edm.Key
    @Edm.String
    public options: string; // должен парситься в массив чисел

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async calculate(
        @odata.result
        result: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
            name: string;
            options: string;
        },
        @odata.body body: { begin: string; end: string }
    ) {
        const { exchange, currency, asset, period, name, options } = result;
        const { begin, end } = body;

        const db = await connect();
        const candles = await db
            .collection("candle")
            .find({
                $and: [
                    {
                        exchange,
                        currency,
                        asset,
                        period,
                    },
                    {
                        time: { $gte: begin },
                    },
                    {
                        time: { $lte: end },
                    },
                ],
            })
            .sort({ time: 1 })
            .map((e) => new Candle(e))
            .toArray();

        const parsedOptions: number[] = JSON.parse(`[${options}]`);

        const indicators = await IndicatorService.getIndicators(
            candles,
            name,
            parsedOptions
        );

        const collection = await db.collection("indicator");

        indicators.forEach(async ({ time, values }) => {
            await collection.findOneAndUpdate(
                {
                    exchange,
                    currency,
                    asset,
                    period,
                    name,
                    options,
                    time,
                },
                {
                    $set: {
                        exchange,
                        currency,
                        asset,
                        period,
                        name,
                        options,
                        time,
                        values,
                    },
                },
                { upsert: true }
            );
        });
    }
}
