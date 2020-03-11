import { EventEmitter } from "events";
import {
  getTicker,
  ICandle,
  ITicker,
  liveCandles,
  liveTicker
} from "exchange-service";
import moment from "moment";

export class ExchangeService extends EventEmitter {
  public exchange: string;
  public currency: string;
  public asset: string;
  public period: number;
  public currencyAvailable: number = 0;
  public currencyReserved: number = 0;
  public assetAvailable: number = 0;
  public assetReserved: number = 0;
  private _tickerStream: any;
  private _candlesStream: any;

  constructor({
    exchange,
    currency,
    asset,
    period,
    currencyAvailable
  }: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    currencyAvailable: number;
  }) {
    super();
    Object.assign(this, {
      exchange,
      currency,
      asset,
      period,
      currencyAvailable
    });
  }

  public async getAssetAvailable(): Promise<number> {
    return Promise.resolve(this.assetAvailable);
  }

  public async getCurrencyAvailable(): Promise<number> {
    return Promise.resolve(this.currencyAvailable);
  }

  public async getTicker(): Promise<ITicker> {
    const { exchange, currency, asset } = this;
    return getTicker({
      exchange,
      currency,
      asset
    });
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
    // TODO лучше обрабатывать ошибки
    if (price <= 0 || quantity <= 0) {
      return Promise.reject();
    }

    const amount = price * quantity; // TODO заменить на более точное вычисление
    const { currencyAvailable, assetAvailable } = this;

    switch (side) {
      case "buy":
        if (amount > currencyAvailable) {
          return Promise.reject();
        }
        this.currencyAvailable -= amount;
        this.currencyReserved += amount;
        break;
      case "sell":
        if (quantity > assetAvailable) {
          return Promise.reject();
        }
        this.assetAvailable -= quantity;
        this.assetReserved += quantity;
        break;
      default:
        return Promise.reject();
    }
    this._emitBalance();

    // вернуть ошибку, если невозможно выполнить
    // изменить баланс
    setTimeout(() => {
      if (side === "buy") {
        this.currencyReserved -= amount;
        this.assetAvailable += quantity;
      } else {
        this.assetReserved -= quantity;
        this.currencyAvailable += amount;
      }

      this.emit("trade", {
        parameters: {
          time: moment.utc().toISOString(),
          side,
          price,
          quantity,
          amount
        }
      });

      this._emitBalance();
    }, 0);
    return Promise.resolve("");
  }

  public async stopTicker(): Promise<void> {
    const tickerStream = this._tickerStream;
    return new Promise(resolve => {
      tickerStream.on("close", resolve);
      tickerStream.destroy();
    });
  }

  public async stopCandles(): Promise<void> {
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

  private _emitBalance() {
    const {
      currencyAvailable,
      currencyReserved,
      assetAvailable,
      assetReserved
    } = this;

    this.emit("balance", {
      parameters: {
        currencyAvailable,
        currencyReserved,
        assetAvailable,
        assetReserved
      }
    });
  }
}
