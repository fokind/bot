import { EventEmitter } from "events";
import { ICandle, ITicker, liveCandles, liveTicker } from "exchange-service";
import moment from "moment";

export class ExchangeService extends EventEmitter {
  public sessionId: string;
  public exchange: string;
  public currency: string;
  public asset: string;
  public period: number;
  private _tickerStream: any;
  private _candlesStream: any;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }

  public async createOrder({
    side,
    price,
    quantity
  }: {
    side: string;
    price: number;
    quantity: number;
  }): Promise<string> {
    setTimeout(() => {
      this.emit("trade", {
        parameters: {
          time: moment.utc().toISOString(),
          side,
          price,
          quantity,
          amount: price * quantity
        }
      });
    }, 1);
    return Promise.resolve("1");
  }

  public async stopTicker(): Promise<void> {
    const tickerStream = this._tickerStream;
    return new Promise(resolve => {
      tickerStream.on("close", resolve);
      tickerStream.destroy();
    });
  }

  public async stopCandles(): Promise<void> {
    const sessionId = this.sessionId;
    const candlesStream = this._candlesStream;
    return new Promise(resolve => {
      candlesStream.on("close", resolve);
      candlesStream.destroy();
    });
  }

  public async stop(): Promise<[void, void]> {
    return Promise.all([this.stopTicker(), this.stopCandles()]);
  }

  public startTicker() {
    const { exchange, currency, asset } = this;
    let tickerStream = this._tickerStream;
    if (!tickerStream) {
      tickerStream = liveTicker({
        exchange,
        currency,
        asset
      });
      this._tickerStream = tickerStream;
      tickerStream.on("data", (ticker: ITicker) => {
        this.emit("ticker", ticker);
      });
    }
  }

  public startCandles() {
    const { exchange, currency, asset, period } = this;
    let candlesStream = this._candlesStream;
    if (!candlesStream) {
      candlesStream = liveCandles({
        exchange,
        currency,
        asset,
        period
      });
      this._candlesStream = candlesStream;
      candlesStream.on("data", (candles: ICandle[]) => {
        this.emit("candles", candles);
      });
    }
  }

  public start() {
    this.startTicker();
    this.startCandles();
  }
}
