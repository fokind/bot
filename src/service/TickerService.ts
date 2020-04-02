import { ExchangeService, ITicker } from "exchange-service";
import { Readable } from "stream";
import { EventBus } from "./EventBus";

export class TickerService {
  public static async getTicker(options: {
    exchange: string;
    currency: string;
    asset: string;
  }): Promise<ITicker> {
    return ExchangeService.getTicker(options);
  }

  public static subscribe(options: {
    exchange: string;
    currency: string;
    asset: string;
  }) {
    const stream = ExchangeService.getTickerStream(options);

    TickerService.streams.push({
      key: options,
      stream
    });

    stream.on("data", (ticker: ITicker) => {
      EventBus.emitTicker(ticker);
    });
  }

  public static async unsubscribe({
    exchange,
    currency,
    asset
  }: {
    exchange: string;
    currency: string;
    asset: string;
  }): Promise<void> {
    const index = TickerService.streams.findIndex(
      e =>
        e.key.exchange === exchange &&
        e.key.currency === currency &&
        e.key.asset === asset
    );

    if (index === -1) {
      return Promise.resolve();
    }

    const { stream } = TickerService.streams.splice(index)[0];

    return new Promise(resolve => {
      stream.on("close", resolve);
      stream.destroy();
    });
  }

  private static streams: Array<{
    key: {
      exchange: string;
      currency: string;
      asset: string;
    };
    stream: Readable;
  }> = [];
}
