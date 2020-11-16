import { ObjectID } from "mongodb";

export interface IBacktest {
    _id?: ObjectID;
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    strategyName: string;
    strategyWarmup: number;
    strategyCode: string;
    strategyIndicatorInputs: string;
    stoplossLevel: number;
    fee: number;
    initialBalance: number;
    finalBalance?: number;
    maxDrawDown?: number;
    tradesCount?: number;
    winningTradesCount?: number;
    losingTradesCount?: number;
    winningTradesPercentage?: number;
    losingTradesPercentage?: number;
    maxLosingSeriesLength?: number;
}
