import { GetServerSideProps } from "next";
import PropTypes from "prop-types";
import { IdealBacktestService } from "../../services/IdealBacktestService";
import { IIdealBacktest } from "../../interfaces/IIdealBacktest";
import { ICandle } from "../../interfaces/ICandle";
import CandlestickChart from "../../components/CandlestickChart";
import IndicatorChart from "../../components/IndicatorChart";
import { IRoundtrip } from "../../interfaces/IRoundtrip";
import _ from "lodash";
import moment from "moment";
import { IIndicator } from "../../interfaces/IIndicator";
import { IIndicatorInput } from "../../interfaces/IIndicatorInput";
import { AnalysisService } from "../../services/AnalysisService";

export default function Ideal({
    backtest,
    candles,
    roundtrips,
    indicators,
}: {
    backtest: IIdealBacktest;
    candles: ICandle[];
    roundtrips: IRoundtrip[];
    indicators: IIndicator[];
}) {
    console.log(backtest);
    const width = 1200;
    return (
        <>
            <CandlestickChart
                candles={candles}
                height={480}
                width={width}
                period={backtest.period}
                roundtrips={roundtrips}
            />
            <>
                {indicators.map((e, i) => (
                    <IndicatorChart
                        key={i}
                        points={e.output.map((e) => ({
                            time: e.time,
                            value: e.values[0],
                        }))}
                        height={120}
                        width={width}
                        period={backtest.period}
                        overboughtZone={100}
                        oversoldZone={-100}
                    />
                ))}
            </>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { params, query } = (context as unknown) as {
        params: { id: string };
        query: {
            start: string;
            end: string;
            indicators: string;
        };
    };
    const { id } = params;
    const { start: sliceStart, end: sliceEnd, indicators: indicatorsString } = query;

    const backtest = await IdealBacktestService.findOne(id);
    const { exchange, currency, asset, period, begin, end } = backtest;

    const indicatorInputs: IIndicatorInput[] = indicatorsString
        ? indicatorsString.split(" ").map((e) => {
              const { index } = e.match(/\(/);
              return {
                  name: e.slice(0, index),
                  options: e
                      .slice(index + 1, e.length - 1)
                      .split(",")
                      .map((e1) => +e1),
              };
          })
        : [];

    const { indicators: analysisIndicators } = await AnalysisService.get({
        exchange,
        currency,
        asset,
        period,
        begin,
        end,
        indicatorInputs,
    });

    const candles = (await IdealBacktestService.findCandles(id)).slice(+sliceStart, +sliceEnd);
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
            indicators: analysisIndicators.map((e) => ({
                name: e.name,
                options: e.options,
                output: e.output.filter((e1) => moment.utc(e1.time).isBetween(first, last, undefined, "[]")),
            })),
        },
    };
};

Ideal.propTypes = {
    backtest: PropTypes.object,
    candles: PropTypes.array,
    roundtrips: PropTypes.array,
    indicators: PropTypes.array,
};