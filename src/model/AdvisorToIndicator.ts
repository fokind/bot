import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class AdvisorToIndicator {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public exchange: string;

    @Edm.String
    public currency: string;

    @Edm.String
    public asset: string;

    @Edm.Double
    public period: number;

    @Edm.String
    public name: string;

    @Edm.String
    public options: string;

    @Edm.String
    public advisorId: ObjectID;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
