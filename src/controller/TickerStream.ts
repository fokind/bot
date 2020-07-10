import { ExchangeService } from "exchange-service";
import { Edm, odata, ODataController } from "odata-v4-server";
import { TickerStream } from "../model/TickerStream";
import { EventBus } from "../service/EventBus";

@odata.type(TickerStream)
@Edm.EntitySet("TickerStreams")
export class TickerStreamController extends ODataController {
    @odata.GET
    public get(): TickerStream[] {
        return TickerStream._instances.map((e) => new TickerStream(e.key));
    }

    @odata.GET
    public getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string
    ): TickerStream {
        return TickerStream._instances.find(
            (e) =>
                e.key.exchange === exchange &&
                e.key.currency === currency &&
                e.key.asset === asset
        ).key;
    }

    @odata.POST
    public async post(
        @odata.body
        body: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
        }
    ): Promise<TickerStream> {
        const stream = ExchangeService.getTickerStream(body);
        stream.on("data", async (ticker) => {
            console.log(ticker); // UNDONE пока просто пример использования
            EventBus.emitTicker(ticker);
        });

        TickerStream._instances.push({
            key: body,
            stream,
        });
        return new TickerStream(body);
    }

    @odata.DELETE
    public async remove(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string
    ): Promise<number> {
        const index = TickerStream._instances.findIndex(
            (e) =>
                e.key.exchange === exchange &&
                e.key.currency === currency &&
                e.key.asset === asset
        );

        if (index === -1) {
            return Promise.resolve(0);
        }

        const { stream } = TickerStream._instances.splice(index)[0];

        return new Promise((resolve) => {
            stream.on("close", () => resolve(1));
            stream.destroy();
        });
    }
}
