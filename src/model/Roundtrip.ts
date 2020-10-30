import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Roundtrip {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public begin: string;

    @Edm.String
    public end: string;

    @Edm.Double
    public openPrice: number;

    @Edm.Double
    public closePrice: number;

    @Edm.Double
    public openAmount: number;

    @Edm.Double
    public closeAmount: number;

    @Edm.Double
    public fee: number;

    @Edm.Double
    public profit: number;

    @Edm.String
    public backtestId: ObjectID;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
