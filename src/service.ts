import es from "event-stream";
import { EventEmitter } from "events";
import WebSocket from "ws";
import { liveTicker } from "get-candles";
import { ObjectID } from "mongodb";

export declare interface Service {
    on(event: 'ticker', listener: (name: string) => void): this;
    on(event: string, listener: Function): this;
}

export class Service extends EventEmitter {
  public static streams: any = {}; // ключем должен быть идентификатор сессии, т.к. разные сессии с одинаковыми параметрами могут иметь свои источники

  public async start(sessionId: string): Promise<string> {
    // const ws = new WebSocket("wss://api.hitbtc.com/api/2/ws"); // это все перенести в отдельный коннектор

    // ws.on("open", () => {
    //   ws.send(
    //     JSON.stringify({
    //       method: "subscribeTicker",
    //       params: { symbol: "ETHBTC" },
    //       id: 1
    //     })
    //   );
    // });

    // ws.on("message", e => {
    //   const data: { method: string; params: { ask: string } } = JSON.parse(
    //     e as string
    //   );
    //   if (data.params && data.params.ask) {
    //     this.emit(data.method, data.params.ask);
    //   }
    // });
    
    const parentId = new ObjectID(sessionId);

    const db = await connect();
    
    const {
        exchange,
        currency,
        asset
    } = await db.collection("session").findOne({ _id: parentId });

    const rs = liveTicker({
        exchange,
        currency,
        asset
    }).pipe(
        es.map((chunk: any, next: any) => {
          const data: { ask: string, bid: string } = JSON.parse(chunk) as { ask: string, bid: string };
          const ticker = new Ticker(await db.collection("ticker").updateOne({
              parentId
            }, data, { upsert: true }));
        this.emit("ticker", ticker);
        next();
        })
      );

      rs.on("end", () => resolve());
  }
}
