import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Balance {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public currency: string;

    @Edm.Double
    public available: number = 0;

    @Edm.Double
    public reserved: number = 0;

    @Edm.String
    public accountId: ObjectID;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
