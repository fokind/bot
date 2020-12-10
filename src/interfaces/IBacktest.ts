import { ObjectID } from "mongodb";
import { IIndicatorInput } from "./IIndicatorInput";
import { IIndicatorOutput } from "./IIndicatorOutput";
import { IRoundtrip } from "./IRoundtrip";

export interface IBacktest {
    _id?: string | ObjectID;
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    strategyName: string;
    strategyCode: string;
    indicatorInputs?: Record<string, IIndicatorInput>;
    stoplossLevel: number;
    fee: number;
    trailingStop: boolean;
    initialBalance: number;
    finalBalance?: number;
    maxDrawDown?: number;
    tradesCount?: number;
    winningTradesCount?: number;
    losingTradesCount?: number;
    winningTradesPercentage?: number;
    losingTradesPercentage?: number;
    maxLosingSeriesLength?: number;
    roundtrips?: IRoundtrip;
    indicatorOutputs?: Record<string, IIndicatorOutput[]>;
}
