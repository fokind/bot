import { ICandle } from "./ICandle";
import { IIndicator } from "./IIndicator";

export interface IView {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    candles: ICandle[];
    indicators: IIndicator[];
}
