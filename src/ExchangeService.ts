import { EventEmitter } from "events";
import { ICandle, ITicker, liveCandles, liveTicker } from "exchange-service";

export class ExchangeService extends EventEmitter {
  public static async stop(sessionId: string): Promise<void> {
    const tickerStream = ExchangeService._tickerStreams[sessionId];
    delete ExchangeService._tickerStreams[sessionId];
    return new Promise(resolve => {
      tickerStream.on("close", resolve);
      tickerStream.destroy();
    });
  }
  private static _tickerStreams: any = {};
  private static _candlesStreams: any = {};

  public sessionId: string;
  public exchange: string;
  public currency: string;
  public asset: string;
  public period: number;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }

  public startTicker() {
    const { exchange, currency, asset } = this;
    let tickerStream = ExchangeService._tickerStreams[this.sessionId];
    if (!tickerStream) {
      tickerStream = liveTicker({
        exchange,
        currency,
        asset
      });
      ExchangeService._tickerStreams[this.sessionId] = tickerStream;
      tickerStream.on("data", (ticker: ITicker) => {
        this.emit("ticker", ticker);
      });
    }
  }

  public startCandles() {
    const { exchange, currency, asset, period } = this;
    let candlesStream = ExchangeService._candlesStreams[this.sessionId];
    if (!candlesStream) {
      candlesStream = liveCandles({
        exchange,
        currency,
        asset,
        period
      });
      ExchangeService._candlesStreams[this.sessionId] = candlesStream;
      candlesStream.on("data", (candles: ICandle[]) => {
        this.emit("candles", candles);
      });
    }
  }

  public start() {
    this.startTicker();
    this.startCandles();
  }

  public async stop(): Promise<void> {
    return ExchangeService.stop(this.sessionId);
  }
}
