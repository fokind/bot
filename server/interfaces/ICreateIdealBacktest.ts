export interface ICreateIdealBacktest {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    fee: number;
    initialBalance: number;
}
