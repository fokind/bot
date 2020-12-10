import { ObjectID } from "mongodb";

export interface IBalanceItem {
    _id?: string | ObjectID;
    time: string;
    available: number;
    backtestId?: string | ObjectID;
}
