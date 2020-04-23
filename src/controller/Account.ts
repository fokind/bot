import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Account } from "../model/Account";
import { Balance } from "../model/Balance";
import { Order } from "../model/Order";
import { AccountService } from "../service/AccountService";

const collectionName = "account";

@odata.type(Account)
@Edm.EntitySet("Account")
export class AccountController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<Account[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: Account[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new Account(e))
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
    ): Promise<Account> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = new Account(
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
    ): Promise<Account> {
        const result = new Account(body);
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

    @odata.GET("Balance")
    public async getBalance(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Balance[]> {
        const accountId = new ObjectID(result._id);
        const orders = AccountService.orders.filter((e) =>
            e.accountId.equals(accountId)
        );
        const mongodbQuery = createQuery(query);
        const collection = (await connect())
            .collection("balance")
            .find({
                $and: [
                    {
                        accountId,
                    },
                    mongodbQuery.query,
                ],
            })
            .project(mongodbQuery.projection);
        const items: Balance[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => {
                          const order = orders.find(
                              (o) => o.currency === e.currency
                          );
                          if (order) {
                              e.available = e.available - order.quantity;
                              e.reserved = order.quantity;
                          }
                          return new Balance(e);
                      })
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection.count(false);
        }
        return items;
    }

    @odata.GET("Orders")
    public getOrders(@odata.result result: any): Order[] {
        const accountId = new ObjectID(result._id);
        return AccountService.orders.filter((e) =>
            e.accountId.equals(accountId)
        );
    }
}
