import { ObjectID } from "mongodb";
import connect from "../connect";
import { Order } from "../model/Order";

export class AccountService {
    public static orders: Order[] = [];

    public static async makeDeposit(
        accountId: string,
        {
            currency,
            quantity,
        }: {
            currency: string;
            quantity: number;
        }
    ): Promise<void> {
        // запросить баланс
        const oAccountId = new ObjectID(accountId);
        const collection = (await connect()).collection("balance");
        const item = await collection.findOne(
            { accountId: oAccountId, currency },
            { projection: ["_id", "available"] }
        );

        // изменить
        const available = quantity + (item ? item.available : 0);

        // если новый, то создать
        if (item) {
            await collection.updateOne(
                { _id: item._id },
                { $set: { available } }
            );
        } else {
            // если существующий, то сохранить
            await collection.insertOne({
                currency,
                available,
                accountId: oAccountId,
            });
        }
    }

    public static async createOrder(
        accountId: string,
        options: {
            currency: string;
            asset: string;
            side: string;
            price: number;
            quantity: number;
        }
    ): Promise<Order> {
        const order = new Order(
            Object.assign(
                {
                    accountId: new ObjectID(accountId),
                },
                options
            )
        );
        AccountService.orders.push(order);

        return Promise.resolve(order);
    }
}
