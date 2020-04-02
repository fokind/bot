import { EventEmitter } from "events";
import { ITicker } from "exchange-service";

export class EventBus extends EventEmitter {
  public static getEventBus(): EventEmitter {
    return EventBus.eventBus;
  }

  public static emitTicker(ticker: ITicker): boolean {
    return EventBus.eventBus.emit("ticker", ticker);
  }

  public static on(event: string | symbol, listner: (...args: any[]) => void) {
    return EventBus.eventBus.on(event, listner);
  }

  public static onTicker(listner: (ticker: ITicker) => void) {
    return EventBus.eventBus.on("ticker", listner);
  }

  private static eventBus = new EventEmitter();
}
