import { GetStaticProps } from "next";
import PropTypes from "prop-types";
import { BacktestService } from "../../server/services/BacktestService";
import { IBacktest } from "../../server/interfaces/IBacktest";
import { ICandle } from "../../server/interfaces/ICandle";
import CandlestickChart from "../../components/CandlestickChart";
import LineChart from "../../components/LineChart";

export default function Backtest({ backtest, candles }: { backtest: IBacktest; candles: ICandle[] }) {
    return (
        <>
            <CandlestickChart
                points={candles.slice(0, 100)}
                height={160}
                width={480}
                period={backtest.period}
            />
            <LineChart
                points={candles.slice(0, 100).map((e) => ({ value: e.close, time: e.time }))}
                height={160}
                width={480}
                period={backtest.period}
            />
        </>
    );
}

export async function getStaticPaths() {
    const paths = (await BacktestService.findAllIds()).map((e) => ({
        params: {
            id: e,
        },
    }));

    return {
        paths,
        fallback: false,
    };
}

export const getStaticProps: GetStaticProps = async ({
    params,
}: {
    params: {
        id: string;
    };
}) => {
    const { id: backtestId } = params;
    const backtest = await BacktestService.findOne(backtestId);
    const candles = await BacktestService.findCandles(backtestId);

    return {
        props: {
            backtest,
            candles,
        },
    };
};

Backtest.propTypes = {
    backtest: PropTypes.object,
    candles: PropTypes.array,
};

/*
вернуть и показать в svg свечи, относящиеся к бэктесту
*/
