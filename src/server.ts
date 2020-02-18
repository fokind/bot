import es from "event-stream";
import { Edm, odata, ODataServer } from "odata-v4-server";

@odata.cors
@odata.namespace("Bot")
export class BotServer extends ODataServer {}
