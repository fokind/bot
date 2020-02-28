import es from "event-stream";
import { EventEmitter } from "events";
import WebSocket from "ws";
import { liveTicker, liveCandles } from "exchange-service";
import { ObjectID } from "mongodb";

// export declare interface Service {
//     on(event: 'ticker', listener: (name: string) => void): this;
//     on(event: 'candles', listener: (name: string) => void): this;
//     on(event: string, listener: Function): this;
// }

export class ExchangeService extends EventEmitter {
  private static _tickerStreams: any = {};
  private static _candlesStreams: any = {};

  public sessionId: string;
  public exchange: string;
  public currency: string;
  public asset: string;
  public period: number;

constructor(data: any) {
    Object.assign(this, data);
  }
  
  public start(): Promise<void> {
      let tickerStream = ExchangeService._tickerStreams[this.sessionId];
      if (!tickerStream) {
    const tickerStream = liveTicker({
        exchange,
        currency,
        asset
    });
          ExchangeService._tickerStreams[this.sessionId] = tickerStream;
    tickerStream.on("data", chunk => {
        this.emit("ticker", chunk);
    });
      }
  }
 
  public async stop(): Promise<void> {
      let tickerStream = ExchangeService._tickerStreams[this.sessionId];
          delete ExchangeService._tickerStreams[this.sessionId];
      return new Promise(resolve => {
          tickerStream.on("close", resolve);
          tickerStream.destroy();
      });
  }
}
