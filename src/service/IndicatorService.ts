import { ICandle } from "exchange-service";
import * as tulind from "tulind";

export interface IIndicator {
    time: string;
    values: number[];
}

export class IndicatorService {
    public static getStart(
        name: string,
        options: number[]
    ): number {
        return tulind.indicators[name].start(options) as number;
    }

    public static async getIndicators(
        candles: ICandle[],
        name: string,
        options: number[]
    ): Promise<IIndicator[]> {
        const indicatorOutputs = await (tulind.indicators[name].indicator(
            (tulind.indicators[name].input_names as string[]).map((e) =>
                candles.map((c) => (c as any)[e === "real" ? "close" : e])
            ),
            options
        ) as Promise<number[][]>); // некоторые индикаторы возвращают несколько рядов данных, например, MACD

        const length = indicatorOutputs[0].length;
        const indicators: IIndicator[] = [];

        // перебирать начиная с последнего элемента
        for (let i = 1; i <= length; i++) {
            indicators.push({
                time: candles[candles.length - i].time,
                values: indicatorOutputs.map((e) => e[length - i]),
            });
        }

        return indicators.reverse();
    }
}
