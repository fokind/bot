import { EventEmitter } from "events";
import { ICandle } from "exchange-service";
import moment from "moment";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { BotServer } from "../server";
import { ExchangeService } from "./ExchangeService";

async function onCandles(
  {
    exchange,
    currency,
    asset,
    period
  }: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
  },
  candles: ICandle[]
) {
  const eventBus = BotServer.eventBus;
  const db = await connect();
  candles
    .map(e =>
      Object.assign(
        {
          exchange,
          currency,
          asset,
          period
        },
        e
      )
    )
    .forEach(async candle => {
      await db.collection("candle").updateOne(
        {
          exchange,
          currency,
          asset,
          period,
          time: candle.time
        },
        { $set: candle },
        { upsert: true }
      );
      eventBus.emit("candle", candle);
    });
}

async function onTicker({
  exchange,
  currency,
  asset,
  ask,
  bid
}: {
  exchange: string;
  currency: string;
  asset: string;
  ask: number;
  bid: number;
}) {
  const db = await connect();

  const ticker1 = {
    exchange,
    currency,
    asset,
    ask,
    bid
  };

  await db.collection("ticker").updateOne(
    {
      exchange,
      currency,
      asset
    },
    { $set: ticker1 },
    { upsert: true }
  );
  BotServer.eventBus.emit("ticker", ticker1);
}

export class SessionService extends EventEmitter {
  public static async createOrder(
    sessionId: string,
    options: {
      side: string;
      price: number;
      quantity: number;
    }
  ): Promise<string> {
    return SessionService.getInstance(sessionId).createOrder(options);
  }

  public static createInstance(
    sessionId: string,
    options: {
      sessionId: string;
      exchange: string;
      currency: string;
      asset: string;
      period: number;
    }
  ): SessionService {
    const sessionService = new SessionService(options);
    SessionService._instances[sessionId] = sessionService;
    return sessionService;
  }

  public static getInstance(sessionId: string): SessionService {
    return SessionService._instances[sessionId];
  }

  public static async start(
    sessionId: string,
    options?: {
      sessionId: string;
      exchange: string;
      currency: string;
      asset: string;
      period: number;
    }
  ): Promise<void> {
    return (
      SessionService.getInstance(sessionId) ||
      SessionService.createInstance(sessionId, options)
    ).start();
  }

  public static async stop(sessionId: string): Promise<void> {
    return SessionService.getInstance(sessionId).stop();
  }

  public static async buy(sessionId: string): Promise<void> {
    return SessionService.getInstance(sessionId).buy();
  }

  public static async sell(sessionId: string): Promise<void> {
    return SessionService.getInstance(sessionId).sell();
  }

  private static _instances: any = {};

  public sessionId: string;
  private _exchangeService: ExchangeService;

  constructor({
      sessionId,
  exchange,
  currency,
  asset,
  period,
  initialBalance
  }: {
      sessionId: string;
  exchange: string;
  currency: string;
  asset: string;
  period: number;
  initialBalance: number;
  }) {
    super();
    Object.assign(this, {
      sessionId
  });
    this._exchangeService = new ExchangeService({
  exchange,
  currency,
  asset,
  period,
  currencyAvailable: initialBalance
  });
    this._exchangeService.on("trade", async (event: any) => {
      await this.onExchangeTrade(event);
    });
    this._exchangeService.on("balance", async (event: any) => {
      await this.onExchangeBalance(event); // UNDONE
    });
    // UNDONE подписать на остальные события
  }

  public async onExchangeTrade(event: {
    parameters: {
      time: string;
      side: string;
      price: number;
      quantity: number;
      amount: number;
    };
  }) {
    const { time, side, price, quantity, amount } = event.parameters;

    const trade: any = {
      time,
      side,
      price,
      quantity,
      amount,
      sessionId: this.sessionId
    };

    const db = await connect();
    const collectionTrade = db.collection("trade");
    trade._id = (await collectionTrade.insertOne(trade)).insertedId;

    BotServer.eventBus.emit("trade", trade);
  }

  public async start(): Promise<void> {
    const sessionId = this.sessionId;
    const begin = moment.utc().toISOString();
    const _id = new ObjectID(sessionId);
    const db = await connect();
    const collectionSession = db.collection("session");
    await collectionSession.updateOne(
      { _id },
      {
        $set: {
          begin
        }
      }
    );

    const {
      exchange,
      currency,
      asset,
      period
    } = await collectionSession.findOne({ _id });

    const service = this._exchangeService;

    service.on("ticker", async ticker => {
      await onTicker(
        Object.assign(
          {
            exchange,
            currency,
            asset
          },
          ticker
        )
      );
    });

    service.on("candles", async (candles: ICandle[]) => {
      await onCandles(
        {
          exchange,
          currency,
          asset,
          period
        },
        candles
      );
    });

    await service.start();
  }

  public async stop(): Promise<void> {
    const sessionId = this.sessionId;
    await this._exchangeService.stop();
    const end = moment.utc().toISOString();
    const _id = new ObjectID(sessionId);
    await (await connect()).collection("session").updateOne(
      { _id },
      {
        $set: {
          end
        }
      }
    );
  }

  public async createOrder(options: {
    side: string;
    price: number;
    quantity: number;
  }): Promise<string> {
    return await this._exchangeService.createOrder(options);
  }
  
  public async buy(): Promise<void> {
      const { ask, bid } = await this._exchangeService.getTicker();
      const price: number = (ask + bid) / 2; // UNDONE округлить до заданной точности
      const available: number = await this.getCurrencyAvailable();
      const quantity: number = available / price; // UNDONE округлить в меньшую сторону до заданной точности

  await this.createOrder({
      side: "buy", price, quantity
  });
  }  
  
  public async sell(): Promise<void> {
      const { ask, bid } = await this._exchangeService.getTicker();
      const price: number = (ask + bid) / 2; // UNDONE округлить до заданной точности
      const quantity: number = await this.getAssetAvailable();

  await this.createOrder({
      side: "sell", price, quantity
  });
  }
}
