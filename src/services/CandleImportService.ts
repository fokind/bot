import { ObjectID } from "mongodb";
import connect from "../connect";
import { ICandleImport } from "../interfaces/ICandleImport";

const collectionName = "candleImport";

export class CandleImportService {
    static async findAll(): Promise<ICandleImport[]> {
        return (await connect())
            .collection<ICandleImport>(collectionName)
            .find()
            .toArray();
    }

    static async findOne(id: string): Promise<ICandleImport> {
        const _id = new ObjectID(id);
        return (await connect())
            .collection<ICandleImport>(collectionName)
            .findOne({ _id });
    }
}
