import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Balance {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public time: string;

    @Edm.Double
    public available: number = 0;

    @Edm.String
    public backtestId: ObjectID;

    constructor(options?: {
        _id?: ObjectID;
        time?: string;
        available?: number;
        backtestId?: ObjectID;
    }) {
        Object.assign(this, options);
    }
}
