import { ICandle } from "../interfaces/ICandle";
import { IIndicator } from "../interfaces/IIndicator";
import { IIndicatorInput } from "../interfaces/IIndicatorInput";
import { IView } from "../interfaces/IView";
import { CandleService } from "./CandleService";
import { IndicatorService } from "crypto-backtest";
import _ from "lodash";
import moment from "moment";

export class AnalysisService {
    static async get(options: {
        exchange: string;
        currency: string;
        asset: string;
        period: number;
        begin: string;
        end: string;
        indicatorInputs: IIndicatorInput[];
    }): Promise<IView> {
        const { exchange, currency, asset, period, begin, end, indicatorInputs } = options;
        const momentBegin = moment.utc(begin);
        const start = _.max(indicatorInputs.map((e) => IndicatorService.getStart(e.name, e.options)));
        const candles: ICandle[] = await CandleService.findAll({
            exchange,
            currency,
            asset,
            period,
            begin: moment
                .utc(begin)
                .add(-start * period, "minutes")
                .toISOString(), // чуть раньше, чтобы хватило прогреть индикаторы
            end,
        });

        const indicators: IIndicator[] = await Promise.all(
            indicatorInputs.map(async (e) =>
                Object.assign(
                    {
                        output: (
                            await IndicatorService.execute({
                                candles,
                                name: e.name,
                                options: e.options,
                            })
                        ).filter((o) => moment.utc(o.time).isSameOrAfter(momentBegin)),
                    },
                    e,
                ),
            ),
        );
        return {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            candles: candles.filter((e) => moment.utc(e.time).isSameOrAfter(momentBegin)),
            indicators: indicators.map(e => ({
                name: e.name,
                options: e.options,
                output: e.output.filter((e) => moment.utc(e.time).isSameOrAfter(momentBegin))
            })),
        };
    }
}
