import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Candle {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.String
  public time: string;

  @Edm.Double
  public open: number;

  @Edm.Double
  public high: number;

  @Edm.Double
  public low: number;

  @Edm.Double
  public close: number;

  @Edm.Double
  public volume: number;

  @Edm.String
  public parentId: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
