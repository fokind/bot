import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Balance } from "../model/Balance";
import { Order } from "../model/Order";

const collectionName = "order";

@odata.type(Order)
@Edm.EntitySet("Orders")
export class OrdersController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<Order[]> {
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

        const result: Order[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new Order(e))
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
    ): Promise<Order> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = new Order(
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
    ): Promise<Order> {
        const result = new Order(body);
        result.accountId = new ObjectID(body.accountId);
        const { currency, quantity } = body;

        const collectionBalance = (await connect()).collection("balance");
        const balance = new Balance(
            await collectionBalance.findOne({
                accountId: result.accountId,
                currency,
            })
        );

        balance.available = balance.available - quantity;
        balance.reserved = quantity;

        await collectionBalance.updateOne(
            { _id: balance._id },
            {
                $set: {
                    available: balance.available,
                    reserved: balance.reserved,
                },
            }
        );

        const collection = await (await connect()).collection(collectionName);
        result._id = (await collection.insertOne(result)).insertedId;
        return result;
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        const _id = new ObjectID(key);

        const collection = (await connect()).collection(collectionName);
        const { accountId, currency, quantity } = new Order(
            await collection.findOne({
                _id,
            })
        );

        const collectionBalance = (await connect()).collection("balance");
        const balance = new Balance(
            await collectionBalance.findOne({
                accountId,
                currency,
            })
        );

        // зарезервировать: уменьшить количество, установить резерв
        balance.available = balance.available + quantity;
        balance.reserved = 0;

        // сохранить
        await collectionBalance.updateOne(
            { _id: balance._id },
            {
                $set: {
                    available: balance.available,
                    reserved: balance.reserved,
                },
            }
        );

        return collection
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }
}
