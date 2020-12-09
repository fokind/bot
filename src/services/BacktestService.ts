import { ObjectID } from "mongodb";
import { ICandle } from "../interfaces/ICandle";
import connect from "../connect";
import { IBacktest } from "../interfaces/IBacktest";

const collectionName = "backtest";

export class BacktestService {
    static async findAll(): Promise<IBacktest[]> {
        return (await connect())
            .collection(collectionName)
            .find()
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                    }) as IBacktest,
            )
            .toArray();
    }

    static async findOne(id: string): Promise<IBacktest> {
        const _id = new ObjectID(id);
        const item = await (await connect())
            .collection(collectionName)
            .findOne({ _id });
        return Object.assign(item, {
            _id: (item._id as ObjectID).toHexString(),
        }) as IBacktest;
    }

    static async findCandles(backtestId: string): Promise<ICandle[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const backtest = await db.collection(collectionName).findOne({ _id });

        const { exchange, currency, asset, period, begin, end } = backtest;

        const collection = db.collection("candle");
        const findQuery = {
            exchange,
            currency,
            asset,
            period,
            time: { $gte: begin, $lte: end },
        };

        const items: ICandle[] = await collection
            .find(findQuery)
            .sort({ time: 1 })
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                    }) as ICandle,
            )
            .toArray();

        return items;
    }
}
