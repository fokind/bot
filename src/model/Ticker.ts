import { Edm } from "odata-v4-server";

export class Ticker {
    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    @Edm.Double
    public ask: number;

    @Edm.Double
    public bid: number;

    constructor(data: any) {
        Object.assign(this, data);
    }
}
