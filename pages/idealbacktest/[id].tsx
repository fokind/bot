import { GetServerSideProps } from "next";
import PropTypes from "prop-types";
import { IdealBacktestService } from "../../services/IdealBacktestService";
import { IIdealBacktest } from "../../interfaces/IIdealBacktest";
import { ICandle } from "../../interfaces/ICandle";
import CandlestickChart from "../../components/CandlestickChart";
import { IRoundtrip } from "../../interfaces/IRoundtrip";
import _ from "lodash";
import moment from "moment";

export default function Ideal({
    backtest,
    candles,
    roundtrips,
}: {
    backtest: IIdealBacktest;
    candles: ICandle[];
    roundtrips: IRoundtrip[];
}) {
    console.log(backtest);
    console.log(roundtrips);
    return (
        <>
            <CandlestickChart
                candles={candles}
                height={480}
                width={640}
                period={backtest.period}
                roundtrips={roundtrips}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { params, query } = (context as unknown) as {
        params: { id: string };
        query: {
            start: string;
            end: string;
        };
    };
    const { id } = params;
    const { start, end } = query;

    const backtest = await IdealBacktestService.findOne(id);
    const candles = (await IdealBacktestService.findCandles(id)).slice(+start, +end);
    const first = moment.utc(_.first(candles).time);
    const last = moment.utc(_.last(candles).time);
    const roundtrips = (await IdealBacktestService.findRoundtrips(id)).filter(
        (e) =>
            moment.utc(e.begin).isBetween(first, last, undefined, "[]") &&
            moment.utc(e.end).isBetween(first, last, undefined, "[]"),
    );

    return {
        props: {
            backtest,
            candles,
            roundtrips,
        },
    };
};

Ideal.propTypes = {
    backtest: PropTypes.object,
    candles: PropTypes.array,
    roundtrips: PropTypes.array,
};

/*
вернуть и показать в svg свечи, относящиеся к бэктесту
*/
