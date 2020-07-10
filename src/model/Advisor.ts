import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { AdvisorService } from "../service/AdvisorService";
import { Candle } from "./Candle";
import { Indicator } from "./Indicator";
import { IndicatorInput } from "./IndicatorInput";
import { Strategy } from "./Strategy";

export class Advisor {
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
    public strategyCodeId: ObjectID;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorInput)))
    public IndicatorInputs: IndicatorInput[];

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async calculate(@odata.result result: any, @odata.body body: any) {
        const { exchange, currency, asset, period } = result;
        const strategyCodeId = new ObjectID(result.strategyCodeId);
        const { begin, end } = body;

        // UNDONE после выполнения этого метода будут доступны советы в базе данных
        // в режиме реального времени можно аналогично

        // загрузить свечи из базы данных, они должны быть импортированы из источника данных?
        // выполнить расчет
        // сохранить в базу данных
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

        const indicators = await db
            .collection("indicator")
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
            .map((e) => new Indicator(e))
            .toArray();

        const { code } = await db.collection("strategy").findOne({ _id: strategyCodeId }) as Strategy;

        const advices = await AdvisorService.getAdvices(candles, indicators, code);

        const collection = await db.collection("advice");

        advices.forEach(async ({ time, side }) => {
            await collection.findOneAndUpdate(
                {
                    exchange,
                    currency,
                    asset,
                    period,
                    strategyCodeId,
                    time,
                },
                {
                    $set: {
                        exchange,
                        currency,
                        asset,
                        period,
                        strategyCodeId,
                        time,
                        side,
                    },
                },
                { upsert: true }
            );
        });
    }
}
