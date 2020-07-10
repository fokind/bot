import { Edm } from "odata-v4-server";
import { Readable } from "stream";

export interface ITickerStreamInstance {
    key: {
        exchange: string;
        currency: string;
        asset: string;
    };
    stream: Readable;
}

export class TickerStream {
    public static _instances: ITickerStreamInstance[] = [];

    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    public constructor(data: any) {
        Object.assign(this, data);
    }
}
