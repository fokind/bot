import { ICandle } from "exchange-service";
import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { DataStreamIndicatorInput } from "./DataStreamIndicatorInput";
import { DataStreamItem } from "./DataStreamItem";

export class DataStream {
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

    @Edm.Boolean
    public active: boolean;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => DataStreamIndicatorInput)))
    public IndicatorInputs: DataStreamIndicatorInput[];

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => DataStreamItem)))
    public Items: DataStreamItem[];

    public constructor(data: any) {
        Object.assign(this, data);
    }
}
