import { ICandle } from "exchange-service";
import * as tulind from "tulind";

interface IAdvice {
    time: string;
    side: string; // buy|sell
}

export class AdvisorService {
    public static async getAdvices(
        candles: ICandle[],
        strategyCode: string
    ): Promise<IAdvice[]> {
        const strategyFunction = new Function(
            "tulind",
            "candles",
            strategyCode
        ) as (tulind: any, candles: ICandle[]) => Promise<IAdvice[]>;

        return strategyFunction(tulind, candles);
    }
}
