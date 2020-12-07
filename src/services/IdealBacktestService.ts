import { ObjectID } from "mongodb";
import connect from "../connect";
import { IIdealBacktest } from "../interfaces/IIdealBacktest";

const collectionName = "idealBacktest";

export class IdealBacktestService {
    static async findAll(): Promise<IIdealBacktest[]> {
        return (await connect())
            .collection<IIdealBacktest>(collectionName)
            .find()
            .toArray();
    }

    static async findOne(id: string): Promise<IIdealBacktest> {
        const _id = new ObjectID(id);
        return (await connect())
            .collection<IIdealBacktest>(collectionName)
            .findOne({ _id });
    }
}
