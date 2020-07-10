import moment from "moment";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Order } from "../model/Order";
import { TickerService } from "../service/TickerService";

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

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        const _id = new ObjectID(key);
        return (await connect())
            .collection(collectionName)
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }

    @odata.POST
    public async post(
        @odata.body
        body: any
    ): Promise<Order> {
        const accountId = new ObjectID(body.accountId);
        const { side, currency, asset, quantity } = body;
        const result = new Order({
            accountId,
            side,
            currency,
            asset,
            quantity,
            active: false,
        });

        const { exchange }: { exchange: string } = await (await connect())
            .collection("account")
            .findOne({
                _id: accountId,
            });

        const ticker = await TickerService.getTicker({
            exchange,
            currency,
            asset,
        });

        const price = side === "buy" ? ticker.ask : ticker.bid;

        const collectionBalance = (await connect()).collection("balance");
        const balanceCurrency = await collectionBalance.findOne({
            accountId,
            currency,
        });
        const amount = quantity * price;
        balanceCurrency.available =
            side === "buy"
                ? balanceCurrency.available - amount
                : balanceCurrency.available + amount;

        await collectionBalance.updateOne(
            { _id: balanceCurrency._id },
            {
                $set: {
                    available: balanceCurrency.available,
                },
            }
        );

        const balanceAsset = await collectionBalance.findOne({
            accountId,
            currency: asset,
        });

        balanceAsset.available =
            side === "buy"
                ? balanceAsset.available + quantity
                : balanceAsset.available - quantity;

        await collectionBalance.updateOne(
            { _id: balanceAsset._id },
            {
                $set: {
                    available: balanceAsset.available,
                },
            }
        );

        const collection = await (await connect()).collection(collectionName);
        result._id = (await collection.insertOne(result)).insertedId;

        const trade = {
            currency,
            asset,
            time: moment.utc().toISOString(),
            side,
            quantity,
            price,
            amount,
            accountId,
        };

        const collectionTrade = await (await connect()).collection("trade");
        await collectionTrade.insertOne(trade);

        return result;
    }
}
