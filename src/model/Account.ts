import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { Balance } from "./Balance";
import { Order } from "./Order";
import { Trade } from "./Trade";

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

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Trade)))
    public Trades: Trade;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
