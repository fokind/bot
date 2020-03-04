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
  const eventBus = BotServer.eventBus;
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
  eventBus.emit("ticker", ticker1);
}

export class SessionService extends EventEmitter {
  public static async start(sessionId: string): Promise<void> {
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

    const service = new ExchangeService({
      exchange,
      currency,
      asset,
      period,
      sessionId
    });

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

  public static async stop(sessionId: string): Promise<void> {
    await ExchangeService.stop(sessionId);
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
}
