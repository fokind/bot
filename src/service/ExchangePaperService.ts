import { EventEmitter } from "events";
import {
  getTicker,
  ICandle,
  ITicker,
  liveCandles,
  liveTicker
} from "exchange-service";
import moment from "moment";

interface IOrder {
  id?: string;
  side: string;
  quantity: number;
  price: number;
  amount: number;
}

interface ITrade {
  id?: string;
  time: string;
  side: string;
  quantity: number;
  price: number;
  amount: number;
}

interface IBalanceItem {
  currency: string;
  available: number;
  reserved: number;
}

export class ExchangePaperService extends EventEmitter {
  public exchange: string;
  public currency: string;
  public asset: string;
  public period: number;
  private tickerStream: any;
  private candlesStream: any;
  private currencyAvailable: number = 0;
  private currencyReserved: number = 0;
  private assetAvailable: number = 0;
  private assetReserved: number = 0;

  private _order?: IOrder;

  constructor({
    exchange,
    currency,
    asset,
    period,
    initialBalance
  }: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    initialBalance: number;
  }) {
    super();
    Object.assign(this, {
      exchange,
      currency,
      asset,
      period,
      currencyAvailable: initialBalance
    });
  }

  public async getOrders(): Promise<IOrder[]> {
    return Promise.resolve([this._order]);
  }

  public async deleteOrders(): Promise<void> {
    delete this._order;
    return Promise.resolve();
  }

  public async getBalance(): Promise<IBalanceItem[]> {
    return Promise.resolve([
      {
        currency: this.currency,
        available: this.currencyAvailable,
        reserved: this.currencyReserved
      },
      {
        currency: this.asset,
        available: this.assetAvailable,
        reserved: this.assetReserved
      }
    ]);
  }

  public async getCurrencyBalance(): Promise<IBalanceItem> {
    return Promise.resolve({
      currency: this.currency,
      available: this.currencyAvailable,
      reserved: this.currencyReserved
    });
  }

  public async getCurrencyAvailable(): Promise<number> {
    return Promise.resolve(this.currencyAvailable);
  }

  public async getAssetAvailable(): Promise<number> {
    return Promise.resolve(this.assetAvailable);
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

    setTimeout(this._completeOrder.bind(this), 0);
    return Promise.resolve("0");
  }

  public async stopTicker(): Promise<void> {
    const tickerStream = this.tickerStream;
    return new Promise(resolve => {
      tickerStream.on("close", resolve);
      tickerStream.destroy();
    });
  }

  public async stopCandles(): Promise<void> {
    const candlesStream = this.candlesStream;
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
    let tickerStream = this.tickerStream;
    if (!tickerStream) {
      tickerStream = liveTicker({
        exchange,
        currency,
        asset
      });
      this.tickerStream = tickerStream;
      tickerStream.on("data", (ticker: ITicker) => {
        this.emit("ticker", ticker);
      });
    }
  }

  public startCandles() {
    const { exchange, currency, asset, period } = this;
    let candlesStream = this.candlesStream;
    if (!candlesStream) {
      candlesStream = liveCandles({
        exchange,
        currency,
        asset,
        period
      });
      this.candlesStream = candlesStream;
      candlesStream.on("data", (candles: ICandle[]) => {
        this.emit("candles", candles);
      });
    }
  }

  public start() {
    this.startTicker();
    this.startCandles();
  }

  private _completeOrder() {
    const time = moment.utc().toISOString();
    const { side, price, amount, quantity } = this._order;
    if (side === "buy") {
      this.currencyReserved -= amount;
      this.assetAvailable += quantity;
    } else {
      this.assetReserved -= quantity;
      this.currencyAvailable += amount;
    }

    delete this._order;

    this.emit("trade", {
      time,
      side,
      price,
      quantity,
      amount
    } as ITrade);
  }
}
