import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { PaperBalance } from "../model/PaperBalance";

const collectionName = "paperBalance";

@odata.type(PaperBalance)
@Edm.EntitySet("PaperBalance")
export class PaperBalanceController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<PaperBalance[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        if (mongodbQuery.query.paperTraderId) {
            mongodbQuery.query.paperTraderId = new ObjectID(
                mongodbQuery.query.paperTraderId
            );
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: PaperBalance[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new PaperBalance(e))
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
    ): Promise<PaperBalance> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = new PaperBalance(
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
    ): Promise<PaperBalance> {
        const result = new PaperBalance(body);
        result.paperTraderId = new ObjectID(body.paperTraderId);

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
        if (body.paperTraderId) {
            body.paperTraderId = new ObjectID(body.paperTraderId);
        }
        const _id = new ObjectID(key);
        return await (await connect())
            .collection(collectionName)
            .updateOne({ _id }, { $set: body })
            .then((result) => result.modifiedCount);
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        const _id = new ObjectID(key);
        const collection = (await connect()).collection(collectionName);
        return collection
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }
}
