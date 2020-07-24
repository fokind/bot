import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class PaperBalance {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public currency: string;

    @Edm.Double
    public available: number = 0;

    @Edm.String
    public paperTraderId: ObjectID;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
