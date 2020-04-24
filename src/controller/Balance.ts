import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Balance } from "../model/Balance";

const collectionName = "balance";

@odata.type(Balance)
@Edm.EntitySet("Balance")
export class BalanceController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<Balance[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        if (mongodbQuery.query.accountId) {
            mongodbQuery.query.accountId = new ObjectID(
                mongodbQuery.query.accountId
            );
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: Balance[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new Balance(e))
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
    ): Promise<Balance> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = new Balance(
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
    ): Promise<Balance> {
        const result = new Balance(body);
        result.accountId = new ObjectID(body.accountId);

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
        if (body.accountId) {
            body.accountId = new ObjectID(body.accountId);
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
