import { ICandle } from "exchange-service";
import { IIndicator } from "./IndicatorService";

interface IAdvice {
    time: string;
    side: string; // buy|sell
}

export class AdvisorService {
    public static async getAdvices(
        candles: ICandle[],
        indicators: IIndicator[],
        strategyCode: string
    ): Promise<IAdvice[]> {
        const strategyFunction = new Function(
            "candles",
            "indicators",
            strategyCode
        ) as (candles: ICandle[], indicators: IIndicator[]) => Promise<IAdvice[]>;

        return strategyFunction(candles, indicators);
    }
}
