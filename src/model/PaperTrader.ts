import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { DataStream } from "./DataStream";
import { PaperBalance } from "./PaperBalance";
import { PaperTrade } from "./PaperTrade";

export class PaperTrader {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.Boolean
    public active: boolean;

    @Edm.String
    public dataStreamId: ObjectID;

    @Edm.EntityType(Edm.ForwardRef(() => DataStream))
    public DataStream: DataStream;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => PaperBalance)))
    public Balance: PaperBalance;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => PaperTrade)))
    public Trades: PaperTrade;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
