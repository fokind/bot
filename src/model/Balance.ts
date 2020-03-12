import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Balance {
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.Key
  @Edm.String
  public currency: string;

  @Edm.Double
  public available: number;

  @Edm.Double
  public reserved: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
