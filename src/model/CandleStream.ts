import { Edm } from "odata-v4-server";
import { Readable } from "stream";

export interface ICandleStreamInstance {
    key: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
    };
    stream: Readable;
}

export class CandleStream {
    public static _instances: ICandleStreamInstance[] = [];

    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    @Edm.Key
    @Edm.Double
    public period: number;

    public constructor(data: any) {
        Object.assign(this, data);
    }
}
