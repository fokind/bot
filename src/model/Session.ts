import moment from "moment";
import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { Candle } from "./Candle";
// import { Trade } from "./Trade";
import { Ticker } from "./Ticker";

export class Session {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

//   @Edm.String
//   public type: string; // "backtest"|"paper"|""

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

//   @Edm.String
//   public indicators: string;

//   @Edm.String
//   public code: string;

//   @Edm.Double
//   public initialBalance: number;

//   @Edm.Double
//   public finalBalance: number;

//   @Edm.Double
//   public profit: number;

//   @Edm.String
//   public status: string; // "active"|"inactive"

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[];

//   @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Trade)))
//   public Trades: Trade[];

  @Edm.EntityType(Edm.ForwardRef(() => Ticker))
  public Ticker: Ticker;

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Edm.Action
  public async start(@odata.result result: any): Promise<void> {
    const _id = new ObjectID(result._id);
    await (await connect()).collection("session").updateOne(
      { _id },
      {
        $set: {
          begin: moment()
            .utc()
            .toISOString()
        }
      }
    );
    
    // создать сервис
    // добавить в репозиторий
    // подписаться на его события, по которым должно происходить сохранение в базу данных
  }

  @Edm.Action
  public async stop(@odata.result result: any): Promise<void> {
    const _id = new ObjectID(result._id);
    await (await connect()).collection("session").updateOne(
      { _id },
      {
        $set: {
          end: moment()
            .utc()
            .toISOString()
        }
      }
    );
  }
}