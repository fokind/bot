import { CandlesImport } from "candles-import";
import { ObjectID } from "mongodb";
import connect from "../utils/connect";
import { ICreateCandleImport } from "../interfaces/ICreateCandleImport";
import { ICandleImport } from "../interfaces/ICandleImport";

const collectionName = "candleImport";

export class CandleImportService {
    static async findAll(): Promise<ICandleImport[]> {
        return (await connect()).collection(collectionName).find().toArray();
    }

    static async findOne(id: string): Promise<ICandleImport> {
        const _id = new ObjectID(id);
        return (await connect()).collection(collectionName).findOne({ _id });
    }

    static async create(body: ICreateCandleImport): Promise<ICandleImport> {
        const { exchange, currency, asset, period, begin, end } = body;
        const candles: any[] = await CandlesImport.execute(body);
        const result: ICandleImport = Object.assign({}, body);
        result.candlesCount = candles.length;
        const db = await connect();
        const collection = await db.collection(collectionName);
        const importId = (await collection.insertOne(result)).insertedId;
        result._id = importId;
        const candleCollection = await db.collection("candle");

        // сначала удалить существующие
        await candleCollection.deleteMany({
            exchange,
            currency,
            asset,
            period,
            time: { $gte: begin, $lte: end },
        });

        await candleCollection.insertMany(
            candles.map((candle) => Object.assign({ exchange, currency, asset, period }, candle)),
        );

        return result;
    }
}
