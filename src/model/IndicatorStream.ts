import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Readable } from "stream";
import { IndicatorStreamInput } from "./IndicatorStreamInput";

export class IndicatorStream {
    public static _instances: Array<{
        key: ObjectID;
        stream: Readable;
    }> = [];

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

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorStreamInput)))
    public Inputs: IndicatorStreamInput[];

    public constructor(data: any) {
        Object.assign(this, data);
    }
}
