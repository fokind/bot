import { ObjectID } from "mongodb";

export interface IRoundtrip {
    _id?: string | ObjectID;
    begin: string;
    end: string;
    openPrice: number;
    closePrice: number;
    openAmount: number;
    closeAmount: number;
    fee: number;
    profit: number;
    backtestId: string | ObjectID;
}
