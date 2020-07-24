import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { DataStream } from "../model/DataStream";
import { PaperBalance } from "../model/PaperBalance";
import { PaperTrade } from "../model/PaperTrade";
import { PaperTrader } from "../model/PaperTrader";

const collectionName = "paperTrader";

@odata.type(PaperTrader)
@Edm.EntitySet("PaperTraders")
export class PaperTraderController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<PaperTrader[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        if (mongodbQuery.query.dataStreamId) {
            mongodbQuery.query.dataStreamId = new ObjectID(
                mongodbQuery.query.dataStreamId
            );
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: PaperTrader[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new PaperTrader(e))
                      .toArray();

        if (mongodbQuery.inlinecount) {
            result.inlinecount = await collection.count(false);
        }
        return result;
    }

    @odata.GET
    public async getOne(
        @odata.key key: string,
        @odata.query query: ODataQuery
    ): Promise<PaperTrader> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = new PaperTrader(
            await (await connect())
                .collection(collectionName)
                .findOne({ _id }, { projection })
        );
        return result;
    }

    @odata.POST
    public async post(
        @odata.body
        body: any
    ): Promise<PaperTrader> {
        if (body.dataStreamId) {
            body.dataStreamId = new ObjectID(body.dataStreamId);
        }
        const result = new PaperTrader(body);
        // TODO если Active то запустить или остановить
        const collection = await (await connect()).collection(collectionName);
        result._id = (await collection.insertOne(result)).insertedId;
        return result;
    }

    @odata.PATCH
    public async patch(
        @odata.key key: string,
        @odata.body body: any
    ): Promise<number> {
        if (body._id) {
            delete body._id;
        }
        if (body.dataStreamId) {
            body.dataStreamId = new ObjectID(body.dataStreamId);
        }
        // TODO если Active то запустить или остановить
        const _id = new ObjectID(key);
        return await (await connect())
            .collection(collectionName)
            .updateOne({ _id }, { $set: body })
            .then((result) => result.modifiedCount);
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        const _id = new ObjectID(key);
        return (await connect())
            .collection(collectionName)
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }

    @odata.GET("DataStream")
    public async getTicker(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<DataStream> {
        const dataStreamId = new ObjectID(result.dataStreamId);
        const db = await connect();
        const collection = db.collection("dataStream");
        const { projection } = createQuery(query);

        return new DataStream(
            await collection.findOne(
                {
                    _id: dataStreamId,
                },
                { projection }
            )
        );
    }

    @odata.GET("Balance")
    public async getBalance(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<PaperBalance[]> {
        const paperTraderId = new ObjectID(result._id);
        const mongodbQuery = createQuery(query);
        const collection = (await connect())
            .collection("paperBalance")
            .find({
                $and: [
                    {
                        paperTraderId,
                    },
                    mongodbQuery.query,
                ],
            })
            .project(mongodbQuery.projection);
        const items: PaperBalance[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new PaperBalance(e))
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection.count(false);
        }
        return items;
    }

    @odata.GET("Trades")
    public async getTrades(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<PaperTrade[]> {
        const paperTraderId = new ObjectID(result._id);
        const mongodbQuery = createQuery(query);
        const collection = (await connect())
            .collection("trade")
            .find({
                $and: [
                    {
                        paperTraderId,
                    },
                    mongodbQuery.query,
                ],
            })
            .project(mongodbQuery.projection);
        const items: PaperTrade[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new PaperTrade(e))
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection.count(false);
        }
        return items;
    }
}
