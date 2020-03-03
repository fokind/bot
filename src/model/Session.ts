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
  
  private async _onCandles(candles: ICandle[]) {
      const {
          exchange,
          currency,
          asset,
          period
        } = this;
      candles.map(e => 
        Object.assign(e, { // косяк, меняются входные данные
          exchange,
          currency,
          asset,
          period
        })
        ).forEach(async candle => {
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

  private async _onTicket({ ask, bid }: { ask: number; bid: number; }) {
      const {
        exchange,
        currency,
        asset
      } = this;

      const ticker = {
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
      await this._onTicker(ticker);
    });

    service.on("candles", async (candles: ICandle[]) => {
      await this._onCandles(candles);
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
