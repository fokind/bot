import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class DataStreamIndicatorInput {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public dataStreamId: ObjectID;

    @Edm.String
    public key: string; // из фиксированного списка tulind

    @Edm.String
    public name: string; // из фиксированного списка tulind

    @Edm.String
    public options: string; // должен парситься в массив чисел

    constructor(data: any) {
        Object.assign(this, data);
    }
}
