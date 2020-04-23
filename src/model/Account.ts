import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { AccountService } from "../service/AccountService";
import { Balance } from "./Balance";
import { Order } from "./Order";

export class Account {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public exchange: string;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Balance)))
    public Balance: Balance;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Order)))
    public Orders: Order;

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public async makeDeposit(
        @odata.result result: any,
        @odata.body
        body: {
            currency: string;
            quantity: number;
        }
    ): Promise<void> {
        return await AccountService.makeDeposit(result._id, body);
    }

    @Edm.Action
    public async createOrder(
        @odata.result result: any,
        @odata.body
        body: {
            currency: string;
            asset: string;
            side: string;
            price: number;
            quantity: number;
        }
    ): Promise<void> {
        await AccountService.createOrder(result._id, body);
    }
}
