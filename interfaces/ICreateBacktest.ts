export interface ICreateBacktest {
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
}
