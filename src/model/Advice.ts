import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Advice {
    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    @Edm.Key
    @Edm.Double
    public period: number;

    @Edm.Key
    @Edm.String
    public strategyCodeId: ObjectID;

    @Edm.Key
    @Edm.String
    public time: string;

    @Edm.String
    public side: string; // buy|sell

    constructor(data: any) {
        Object.assign(this, data);
    }
}
