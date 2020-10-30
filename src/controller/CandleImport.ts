import { CandlesImport } from "candles-import";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { CandleImport } from "../model/CandleImport";

const collectionName = "candleImport";

@odata.type(CandleImport)
@Edm.EntitySet("CandleImports")
export class CandleImportController extends ODataController {
    @odata.GET
    public async get(
        @odata.query query: ODataQuery
    ): Promise<CandleImport[] & { inlinecount?: number }> {
        const db = await connect();
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const result: CandleImport[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await db
                      .collection(collectionName)
                      .find(mongodbQuery.query)
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new CandleImport(e))
                      .toArray();

        if (mongodbQuery.inlinecount) {
            result.inlinecount = await db
                .collection(collectionName)
                .find(mongodbQuery.query)
                .project(mongodbQuery.projection)
                .count(false);
        }
        return result;
    }

    @odata.GET
    public async getOne(
        @odata.key key: string,
        @odata.query query: ODataQuery
    ): Promise<CandleImport> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const db = await connect();
        const session = new CandleImport(
            await db.collection(collectionName).findOne({ _id }, { projection })
        );
        return session;
    }

    @odata.POST
    public async post(
        @odata.body
        body: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
            begin: string;
            end: string;
        }
    ): Promise<CandleImport> {
        const { exchange, currency, asset, period } = body;
        const candles: any[] = await CandlesImport.execute(body);
        const result = new CandleImport(body);
        result.candlesCount = candles.length;
        const db = await connect();
        const collection = await db.collection(collectionName);
        const importId = (await collection.insertOne(result)).insertedId;
        result._id = importId;
        const candleCollection = await db.collection("candle");
        candles.forEach(async (candle) => {
            const { time } = candle;
            await candleCollection.findOneAndUpdate(
                { exchange, currency, asset, period, time },
                { $set: candle },
                { upsert: true }
            );
        });

        return result;
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        // TODO удалить и свечи тоже
        const _id = new ObjectID(key);
        return (await connect())
            .collection(collectionName)
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }
}
