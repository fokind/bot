import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class Trade {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  public _id: ObjectID;

  @Edm.String
  public time: string;

  @Edm.String
  public side: string; // buy||sell

  @Edm.Double
  public quantity: number;

  @Edm.Double
  public price: number;

  @Edm.Double
  public amount: number; // = quantity * price

  @Edm.String
  public sessionId: ObjectID;

  constructor(data: any) {
    Object.assign(this, data);
  }

  // @Edm.Action
  // public subscribe(@odata.result result: any) {
  //   const { exchange, currency, asset } = result;

  //   EventBus.onTicker(ticker => {
  //     console.log(ticker); // UNDONE пока просто пример использования
  //   });

  //   TickerService.subscribe({
  //     exchange,
  //     currency,
  //     asset
  //   });
  // }

  // @Edm.Action
  // public async unsubscribe(@odata.result result: any): Promise<void> {
  //   const { exchange, currency, asset } = result;

  //   return TickerService.unsubscribe({
  //     exchange,
  //     currency,
  //     asset
  //   });
  // }
}
