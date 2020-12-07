import { ObjectID } from "mongodb";

export interface IIndicatorOutput {
    _id?: ObjectID;
    key: string;
    time: string;
    values: number[];
    backtestId: ObjectID;
}
