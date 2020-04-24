import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Trade {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public currency: string;

    @Edm.String
    public asset: string;

    @Edm.String
    public time: string;

    @Edm.String
    public side: string; // buy||sell

    @Edm.Double
    public quantity: number;

    @Edm.Double
    public price: number;

    @Edm.Double
    public amount: number; // = quantity * price

    @Edm.String
    public accountId: ObjectID;

    @Edm.String
    public sessionId: ObjectID;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
