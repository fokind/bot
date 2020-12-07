import { ObjectID } from "mongodb";
import connect from "../connect";
import { IBacktest } from "../interfaces/IBacktest";

const collectionName = "backtest";

export class BacktestService {
    static async findAll(): Promise<IBacktest[]> {
        return (await connect())
            .collection<IBacktest>(collectionName)
            .find()
            .toArray();
    }

    static async findOne(id: string): Promise<IBacktest> {
        const _id = new ObjectID(id);
        return (await connect())
            .collection<IBacktest>(collectionName)
            .findOne({ _id });
    }
}
