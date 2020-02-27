import es from "event-stream";
import { EventEmitter } from "events";
import { Edm, odata, ODataServer } from "odata-v4-server";
import WebSocket from "ws";

@odata.cors
@odata.namespace("Bot")
export class BotServer extends ODataServer {
  public static eventEmitter: EventEmitter = new EventEmitter();

  @Edm.ActionImport()
  public async start(): Promise<string> {
    const eventEmitter = BotServer.eventEmitter;
    const ws = new WebSocket("wss://api.hitbtc.com/api/2/ws"); // это все перенести в отдельный коннектор

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          method: "subscribeTicker",
          params: { symbol: "ETHBTC" },
          id: 1
        })
      );
    });

    ws.on("message", e => {
      const data: { method: string; params: { ask: string } } = JSON.parse(
        e as string
      );
      if (data.params && data.params.ask) {
        eventEmitter.emit(data.method, data.params.ask);
      }
    });
  }
}
