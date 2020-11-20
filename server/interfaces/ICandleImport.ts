import { ObjectID } from "mongodb";

export interface ICandleImport {
    _id?: string | ObjectID;
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    candlesCount?: number;
}
