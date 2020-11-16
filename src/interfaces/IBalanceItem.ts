import { ObjectID } from "mongodb";

export interface IBalanceItem {
    _id?: ObjectID;
    time: string;
    available: number;
    backtestId: ObjectID;
}
