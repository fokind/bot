import { ExchangeService, ICandle } from "exchange-service";
import { Edm, odata, ODataController } from "odata-v4-server";
import connect from "../connect";
import { CandleStream } from "../model/CandleStream";
import { EventBus } from "../service/EventBus";

@odata.type(CandleStream)
@Edm.EntitySet("CandleStreams")
export class CandleStreamController extends ODataController {
    @odata.GET
    public get(): CandleStream[] {
        return CandleStream._instances.map((e) => new CandleStream(e.key));
    }

    @odata.GET
    public getOne(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string,
        @odata.key period: number
    ): CandleStream {
        return CandleStream._instances.find(
            (e) =>
                e.key.exchange === exchange &&
                e.key.currency === currency &&
                e.key.asset === asset &&
                e.key.period === period
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
    ): Promise<CandleStream> {
        const stream = ExchangeService.getCandleStream(body);
        stream.on("data", async (candle: ICandle) => {
            // запись в базу данных
            await (await connect()).collection("candle").findOneAndUpdate(
                Object.assign(
                    {
                        time: candle.time,
                    },
                    body
                ),
                { $set: candle },
                { upsert: true }
            );

            console.log(candle); // UNDONE пока просто пример использования
            EventBus.emitCandle(candle);
        });

        CandleStream._instances.push({
            key: body,
            stream,
        });
        return new CandleStream(body);
    }

    @odata.DELETE
    public async remove(
        @odata.key exchange: string,
        @odata.key currency: string,
        @odata.key asset: string,
        @odata.key period: number
    ): Promise<number> {
        const index = CandleStream._instances.findIndex(
            (e) =>
                e.key.exchange === exchange &&
                e.key.currency === currency &&
                e.key.asset === asset &&
                e.key.period === period
        );

        if (index === -1) {
            return Promise.resolve(0);
        }

        const { stream } = CandleStream._instances.splice(index)[0];

        return new Promise((resolve) => {
            stream.on("close", () => resolve(1));
            stream.destroy();
        });
    }
}
