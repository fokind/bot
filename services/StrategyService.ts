import { ObjectID } from "mongodb";
import connect from "../utils/connect";
import { IStrategy } from "../interfaces/IStrategy";

const collectionName = "strategy";

export class StrategyService {
    static async findAll(): Promise<IStrategy[]> {
        return (await connect())
            .collection(collectionName)
            .find()
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                    }) as IStrategy,
            )
            .toArray();
    }

    static async findOne(id: string): Promise<IStrategy> {
        const _id = new ObjectID(id);
        const item = await (await connect()).collection(collectionName).findOne({ _id });
        return Object.assign(item, {
            _id: (item._id as ObjectID).toHexString(),
        }) as IStrategy;
    }

    static async create(body: IStrategy): Promise<IStrategy> {
        const { warmup, buy, sell } = body;
        const strategy: IStrategy = {
            warmup,
            buy,
            sell,
        };
        const db = await connect();
        const id: ObjectID = (await db.collection(collectionName).insertOne(strategy)).insertedId;
        strategy._id = id.toHexString();
        return strategy;
    }
}
