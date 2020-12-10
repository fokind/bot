import { IIndicatorInput } from "./IIndicatorInput";

export interface ICreateBacktest {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    strategyName: string;
    strategyCode: string;
    indicatorInputs: Record<string, IIndicatorInput>;
    stoplossLevel: number;
    fee: number;
    initialBalance: number;
    trailingStop: boolean;
}
