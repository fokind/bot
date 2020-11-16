import { ObjectID } from "mongodb";

export interface ICandle {
    _id?: ObjectID;
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
