import { ObjectID } from "mongodb";

export interface IIdealBacktest {
    _id?: ObjectID;
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    fee: number;
    initialBalance: number;
    finalBalance?: number;
    tradesCount?: number;
}
