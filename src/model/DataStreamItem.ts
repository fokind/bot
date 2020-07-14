import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { DataStreamIndicatorOutput } from "./DataStreamIndicatorOutput";

export class DataStreamItem {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public dataStreamId: ObjectID;

    @Edm.String
    public time: string;

    @Edm.Double
    public open: number;

    @Edm.Double
    public high: number;

    @Edm.Double
    public low: number;

    @Edm.Double
    public close: number;

    @Edm.Double
    public volume: number;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => DataStreamIndicatorOutput)))
    public Indicators: DataStreamIndicatorOutput[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
