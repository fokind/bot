import { ICandle } from "exchange-service";
import { StrategyInput } from "./StrategyInput";

export interface IAdviceInputItem {
    time: string;
    candle: ICandle;
    indicators: Array<{
        key: string;
        outputs: number[];
    }>;
}

export interface IStrategyInput {
    time: string;
    candle: ICandle;
    indicators: Array<{
        key: string;
        outputs: number[];
    }>;
    indicator: (key: string) => number[];
}

export class AdviceService {
    public static getAdvice(
        data: IAdviceInputItem[],
        strategyCode: string
    ): number {
        const strategyFunction = new Function("data", strategyCode) as (
            data: IStrategyInput[]
        ) => number;
        return strategyFunction(data.map((e) => new StrategyInput(e)));
    }
}
