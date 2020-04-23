import { ObjectID } from "mongodb";
import connect from "../connect";

export class AccountService {
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
}
