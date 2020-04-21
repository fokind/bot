import { EventEmitter } from "events";
import { ICandle, ITicker } from "exchange-service";

export class EventBus extends EventEmitter {
    public static getInstance(): EventEmitter {
        return EventBus.eventBus;
    }

    public static emitCandle(candle: ICandle): boolean {
        return EventBus.eventBus.emit("candle", candle);
    }

    public static emitTicker(ticker: ITicker): boolean {
        return EventBus.eventBus.emit("ticker", ticker);
    }

    public static on(
        event: string | symbol,
        listner: (...args: any[]) => void
    ) {
        return EventBus.eventBus.on(event, listner);
    }

    public static onCandle(listner: (candle: ICandle) => void) {
        return EventBus.eventBus.on("candle", listner);
    }

    public static onTicker(listner: (ticker: ITicker) => void) {
        return EventBus.eventBus.on("ticker", listner);
    }

    private static eventBus = new EventEmitter();
}
