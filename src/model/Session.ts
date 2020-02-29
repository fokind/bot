import { ICandle } from "exchange-service";
import moment from "moment";
import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { ExchangeService } from "../ExchangeService";
import { BotServer } from "../server";
import { Candle } from "./Candle";
import { Ticker } from "./Ticker";

export class Session {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.String
  public exchange: string;

  @Edm.String
  public currency: string;

  @Edm.String
  public asset: string;

  @Edm.Double
  public period: number;

  @Edm.String
  public begin: string;

  @Edm.String
  public end: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[];

  @Edm.EntityType(Edm.ForwardRef(() => Ticker))
  public Ticker: Ticker;

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Edm.Action
  public async start(@odata.result result: any): Promise<void> {
    const begin = moment.utc().toISOString();
    const eventBus = BotServer.eventBus;
    const _id = new ObjectID(result._id);
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
      sessionId: result._id
    });

    service.on("ticker", async ticker => {
      ticker = Object.assign(ticker, {
        exchange,
        currency,
        asset
      });
      await db.collection("ticker").updateOne(
        {
          exchange,
          currency,
          asset
        },
        { $set: ticker },
        { upsert: true }
      );
      eventBus.emit("ticker", ticker);
    });

    service.on("candles", async (candles: ICandle[]) => {
      candles.forEach(async candle => {
        candle = Object.assign(candle, {
          exchange,
          currency,
          asset,
          period
        });
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
    });

    await service.start();
  }

  @Edm.Action
  public async stop(@odata.result result: any): Promise<void> {
    await ExchangeService.stop(result._id);
    const end = moment.utc().toISOString();
    const _id = new ObjectID(result._id);

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
