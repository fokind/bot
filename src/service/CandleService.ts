import { ExchangeService, ICandle } from "exchange-service";
import { Readable } from "stream";
import { EventBus } from "./EventBus";

export class CandleService {
    public static async getCandles(options: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
        begin: string;
        end: string;
    }): Promise<ICandle[]> {
        return new Promise((resolve) => {
            const candles: ICandle[] = [];
            const stream = ExchangeService.getCandles(options);

            stream.on("data", (candle: ICandle) => {
                candles.push(candle);
            });

            stream.on("end", () => {
                resolve(candles);
            });
        });
    }

    public static subscribe(options: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
    }) {
        const stream = ExchangeService.getCandleStream(options);
        CandleService.streams.push({
            key: options,
            stream,
        });
        stream.on("data", (candle: ICandle) => {
            EventBus.emitCandle(candle);
        });
    }

    public static async unsubscribe({
        exchange,
        currency,
        asset,
        period,
    }: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
    }): Promise<void> {
        const index = CandleService.streams.findIndex(
            (e) =>
                e.key.exchange === exchange &&
                e.key.currency === currency &&
                e.key.asset === asset &&
                e.key.period === period
        );

        if (index === -1) {
            return Promise.resolve();
        }

        const { stream } = CandleService.streams.splice(index)[0];

        return new Promise((resolve) => {
            stream.on("close", resolve);
            stream.destroy();
        });
    }

    private static streams: Array<{
        key: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
        };
        stream: Readable;
    }> = [];
}
