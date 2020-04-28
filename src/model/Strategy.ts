import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Strategy {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.Int32
    public warmup: number; // минимальное число точек для расчета

    @Edm.String
    public code: string;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
