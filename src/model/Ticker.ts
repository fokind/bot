import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Ticker {
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.Key
  @Edm.String
  public exchange: string;

  @Edm.Key
  @Edm.String
  public currency: string;

  @Edm.Key
  @Edm.String
  public asset: string;

  @Edm.Double
  public ask: number;

  @Edm.Double
  public bid: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
