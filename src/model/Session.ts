import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { SessionService } from "../service/SessionService";
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
    SessionService.start(result._id);
  }

  @Edm.Action
  public async stop(@odata.result result: any): Promise<void> {
    SessionService.stop(result._id);
  }
}
