import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Ticker {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.Double
  public ask: number;

  @Edm.Double
  public bid: number;

  @Edm.String
  public parentId: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
