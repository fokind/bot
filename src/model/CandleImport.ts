import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Candle } from "./Candle";

export class CandleImport {
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
    public begin: string;

    @Edm.String
    public end: string;

    @Edm.Int32
    public candlesCount: number;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
    public Candles: Candle[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
