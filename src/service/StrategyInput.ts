import { ICandle } from "exchange-service";
import { IStrategyInput } from "./AdviceService";

export class StrategyInput implements IStrategyInput {
    public time: string;
    public candle: ICandle;
    public indicators: Array<{
        key: string;
        outputs: number[];
    }>;

    constructor(data: any) {
        Object.assign(this, data);
    }

    public indicator(key: string): number[] {
        return this.indicators.find((e) => e.key === key).outputs;
    }
}
