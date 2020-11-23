import { ICandle } from "./ICandle";
import { IIndicatorInput } from "./IIndicatorInput";
import { IIndicatorOutput } from "./IIndicatorOutput";

export interface IView {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    begin: string;
    end: string;
    buy: string;
    sell: string;
    candles: ICandle[];
    indicators: Array<
        IIndicatorInput & {
            ouptut: IIndicatorOutput[];
        }
    >;
}
