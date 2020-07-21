import { EventEmitter } from "events";
import { ExchangeService, ICandle } from "exchange-service";
import { Readable } from "stream";
import { IndicatorService } from "./IndicatorService";

interface IIndicatorInput {
    name: string;
    options: number[];
}

interface IIndicator extends IIndicatorInput {
    outputs: number[];
}

interface IDataItem {
    candle: ICandle;
    indicators: IIndicator[];
}

function calculateIndicators(
    candles: ICandle[],
    indicatorInputs: IIndicatorInput[]
): Promise<IIndicator[]> {
    // выполнить вычисление всех индикаторов
    return Promise.all(
        indicatorInputs.map(
            (indicatorInput) =>
                new Promise<{
                    name: string;
                    options: number[];
                    outputs: number[];
                }>((resolve) => {
                    const { name, options } = indicatorInput;
                    const start = 1 + IndicatorService.getStart(name, options);
                    const candles1 = candles
                        .reverse()
                        .slice(0, start)
                        .reverse();
                    // console.log(candles1.length, start);
                    if (candles1.length < start) {
                        resolve({
                            name,
                            options,
                            outputs: [],
                        });
                    } else {
                        IndicatorService.getIndicators(
                            candles1,
                            name,
                            options
                        ).then((indicatorOutput) => {
                            // console.log(candles1, indicatorOutput);
                            resolve({
                                name,
                                options,
                                outputs: indicatorOutput[0].values,
                            });
                        });
                    }
                })
        )
    );
}

export class IndicatorStreamService extends EventEmitter {
    public static _instances: IndicatorStreamService[] = [];

    public static createInstance(options: {
        key: string;
        exchange: string;
        currency: string;
        asset: string;
        period: number;
        indicatorInputs: IIndicatorInput[];
    }): IndicatorStreamService {
        const instance = new IndicatorStreamService(options);
        IndicatorStreamService._instances.push(instance);
        return instance;
    }

    public static async stop(key: string): Promise<number> {
        const instances = IndicatorStreamService._instances;
        const index = instances.findIndex((e) => e.key === key);
        let modifiedCount = 0;
        if (index !== -1) {
            modifiedCount = 1;
            const { stream } = instances.splice(index)[0];
            await new Promise((resolve) => {
                stream.on("close", () => resolve());
                stream.destroy();
            });
        }
        return modifiedCount;
    }

    public key: string;
    public stream: Readable;
    public exchange: string;
    public currency: string;
    public asset: string;
    public period: number;
    public indicatorInputs: IIndicatorInput[];
    public queue: Array<{
        time: string;
        candle: ICandle;
    }> = [];

    private constructor(data: any) {
        super();
        Object.assign(this, data);
    }

    public async start(): Promise<IndicatorStreamService> {
        const options = this;
        console.log(options);
        const stream = ExchangeService.getCandleStream(options);
        this.stream = stream;
        const { key, indicatorInputs } = options;
        const instance = this;

        stream.on("data", (candle: ICandle) => {
            // FIXME на самом старте выполняется асинхронная обработка всех свечей сразу из-за чего индикаторы при первом расчете могут иметь пропуски
            // FIXME индикаторы должны вычисляться последовательно. Вероятно это происходит не в том порядке только при подключении к базе данных
            // в качестве решения, при записи более старой свечи сохранять время к которой она относится и при перерасчете это учитывать
            // в качестве решения, при стриме сначала последовательно сохранять данные в очередь, которая используется для расчета индикаторов, а после полного расчета сохранять в базу данных
            // запись в базу данных

            // добавить в очередь
            // асинхронно обработать
            const { time } = candle;
            const { queue } = instance;
            const item = queue.find((e) => e.time === time);
            if (item) {
                item.candle = candle;
            } else {
                queue.push({
                    time,
                    candle,
                });
            }

            const candles = queue
                .map((e) => e.candle)
                .filter((e) => e.time <= time)
                .sort((a, b) => (a.time > b.time ? 1 : -1));

            // console.log(candles);
            // TODO
            // эта обработка может выполняться в отдельном сервисе
            // сам сервис следит за потоком своих свечей
            // выполняет нужные вычисления
            // можно подписаьтся на его результаты
            // можно остановить и отписаться
            // здесь подписка на него
            // по подписке выполняется сохранение в базе данных
            calculateIndicators(candles, indicatorInputs).then((result) => {
                instance._emitData({
                    candle,
                    indicators: result
                });
            });
        });

        IndicatorStreamService._instances.push(instance);
        return instance;
    }

    public onData(listner: (data: IDataItem) => void) {
        this.on("data", listner);
    }

    public offData(listner: (data: IDataItem) => void) {
        this.off("data", listner);
    }

    private _emitData(data: IDataItem) {
        this.emit("data", data);
    }
}
