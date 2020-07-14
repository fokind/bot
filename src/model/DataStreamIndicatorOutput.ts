import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class DataStreamIndicatorOutput {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public dataStreamItemId: ObjectID;

    @Edm.Collection(Edm.Double)
    public values: number[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
