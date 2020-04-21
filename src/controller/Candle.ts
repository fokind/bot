import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import { Candle } from "../model/Candle";
import { CandleService } from "../service/CandleService";

// только для работы с параметрами для импорта свечей
function getExpressions(filter: ODataQuery): any {
    const result: any = {};
    switch (filter.type) {
        case "EqualsExpression":
            result[filter.value.left.value.raw] = filter.value.right.raw;
            break;
        case "AndExpression":
            Object.assign(
                result,
                getExpressions(filter.value.left),
                getExpressions(filter.value.right)
            );
            break;
        case "GreaterOrEqualsExpression":
            result.begin = filter.value.right.raw.slice(1, -1);
            break;
        case "LesserOrEqualsExpression":
            result.end = filter.value.right.raw.slice(1, -1);
            break;
    }
    return result;
}

@odata.type(Candle)
@Edm.EntitySet("Candle")
export class CandleController extends ODataController {
    @odata.GET
    public async get(@odata.filter filter: ODataQuery): Promise<Candle[]> {
        const {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
        } = getExpressions(filter) as {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
            begin: string;
            end: string;
        };

        // UNDONE добавить проверку на корректность данных для передачи далее
        // FIXME выгружается больше необходимого

        return (
            await CandleService.getCandles({
                exchange,
                currency,
                asset,
                period,
                begin,
                end,
            })
        ).map(
            (candle) =>
                new Candle(
                    Object.assign(
                        {
                            exchange,
                            currency,
                            asset,
                            period,
                        },
                        candle
                    )
                )
        );
    }

    @odata.GET
    public async getOne(
        @odata.key key: string,
        @odata.query query: ODataQuery
    ): Promise<Candle> {
        return Promise.reject();
    }
}
