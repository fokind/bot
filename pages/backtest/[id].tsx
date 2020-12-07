import { GetServerSideProps } from "next";
import { BacktestService } from "../../services/BacktestService";
import BacktestPage from "../../components/BacktestPage";
import _ from "lodash";
import moment from "moment";
import { IIndicatorInput } from "../../interfaces/IIndicatorInput";
import { AnalysisService } from "../../services/AnalysisService";
import { connect } from "react-redux";
import { setStrategyCode, createBacktest } from "../../actions";
import { IBacktest } from "../../interfaces/IBacktest";

export const getServerSideProps: GetServerSideProps<{
    backtest: IBacktest;
}> = async (context) => {
    const { params, query } = (context as unknown) as {
        params: { id: string };
        query: {
            skip: string;
            top: string;
            indicators: string;
        };
    };
    const { id } = params;
    const { skip, top, indicators: indicatorsString } = query;
    const backtest = await BacktestService.findOne(id);
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
    const candles = (await BacktestService.findCandles(id)).slice(+skip, +skip + +top);
    const first = moment.utc(_.first(candles).time);
    const last = moment.utc(_.last(candles).time);
    const roundtrips = (await BacktestService.findRoundtrips(id)).filter(
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

export function mapStateToProps(state: any): { strategyCode: string } {
    const { strategyCode } = state;
    return { strategyCode };
}

export function mapDispatchToProps(
    dispatch: any,
): { onChangeStrategyCode: (strategyCode: string) => void; onSubmit: () => void } {
    return {
        onChangeStrategyCode: (buy) => {
            dispatch(setStrategyCode(buy));
        },
        onSubmit: () => dispatch(createBacktest()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BacktestPage);
