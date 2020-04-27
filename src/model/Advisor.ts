import { Cursor, ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { AdvisorService } from "../service/AdvisorService";
import { Candle } from "./Candle";

export class Advisor {
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
    public strategyCodeId: ObjectID;

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async calculate(@odata.result result: any, @odata.body body: any) {
        const { exchange, currency, asset, period, strategyCodeId } = result;
        const { begin, end } = body;

        // UNDONE после выполнения этого метода будут доступны советы в базе данных
        // в режиме реального времени можно аналогично

        // загрузить свечи из базы данных, они должны быть импортированы из источника данных?
        // выполнить расчет
        // сохранить в базу данных
        const db = await connect();
        const candles: Cursor<Candle> = await db
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
            .map((e) => new Candle(e));

        const collection = await db.collection("advice");

        candles.forEach(async (candle) => {
            const advice = await AdvisorService.getAdvice();
            await collection.findOneAndUpdate(
                {
                    exchange,
                    currency,
                    asset,
                    period,
                    strategyCodeId,
                    time: candle.time,
                },
                {
                    $set: {
                        exchange,
                        currency,
                        asset,
                        period,
                        strategyCodeId,
                        time: candle.time,
                        advice,
                    },
                },
                { upsert: true }
            );
        });
    }
}
