import es from "event-stream";
import moment from "moment";
import { Edm, odata, ODataServer } from "odata-v4-server";

@odata.cors
@odata.namespace("Bot")
export class BotServer extends ODataServer {
  public start() {
    setInterval(() => {
      this.emit("time", moment().toISOString());
    }, 1000);
  }
}
