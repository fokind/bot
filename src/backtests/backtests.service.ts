import { Injectable } from "@nestjs/common";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { IBacktest } from "./interfaces/backtest.interface";

const collectionName = "backtest";

@Injectable()
export class BacktestsService {
    async getBacktests(): Promise<IBacktest[]> {
        return (await connect())
            .collection<IBacktest>(collectionName)
            .find()
            .toArray();
    }

    async getBacktest(id: string): Promise<IBacktest> {
        const _id = new ObjectID(id);
        return (await connect())
            .collection<IBacktest>(collectionName)
            .findOne({ _id });
    }
}
