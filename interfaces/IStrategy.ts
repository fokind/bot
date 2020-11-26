import { ObjectID } from "mongodb";

export interface IStrategy {
    _id?: string | ObjectID;
    warmup: number;
    buy: string;
    sell: string;
}
