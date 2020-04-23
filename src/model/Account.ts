import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Balance } from "./Balance";

export class Account {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public exchange: string;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Balance)))
    public Balance: Balance;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
