import { ObjectID } from "mongodb";
import connect from "../connect";
import { ICandle } from "../interfaces/ICandle";

const collectionName = "candle";

export class CandleService {
    static async findAll(options: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
        begin: string;
        end: string;
    }): Promise<ICandle[]> {
        const db = await connect();
        const { exchange, currency, asset, period, begin, end } = options;
        const collection = db.collection(collectionName);
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
