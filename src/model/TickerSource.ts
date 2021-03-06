import { Edm, odata } from "odata-v4-server";
import { EventBus } from "../service/EventBus";
import { TickerService } from "../service/TickerService";

export class TickerSource {
    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    constructor(data: any) {
        Object.assign(this, data);
    }

    @Edm.Action
    public subscribe(@odata.result result: any) {
        const { exchange, currency, asset } = result;

        EventBus.onTicker((ticker) => {
            console.log(ticker); // UNDONE пока просто пример использования
        });

        TickerService.subscribe({
            exchange,
            currency,
            asset,
        });
    }

    @Edm.Action
    public async unsubscribe(@odata.result result: any): Promise<void> {
        const { exchange, currency, asset } = result;

        return TickerService.unsubscribe({
            exchange,
            currency,
            asset,
        });
    }
}
