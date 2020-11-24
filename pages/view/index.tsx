import { GetServerSideProps } from "next";
import PropTypes from "prop-types";
import { ICandle } from "../../interfaces/ICandle";
import CandlestickChart from "../../components/CandlestickChart";
import LineChart from "../../components/LineChart";
import { AnalysisService } from "../../services/AnalysisService";

export default function View({ period, candles }: { period: number; candles: ICandle[] }) {
    return (
        <>
            <CandlestickChart points={candles.slice(0, 100)} height={160} width={480} period={period} />
            <LineChart
                points={candles.slice(0, 100).map((e) => ({ value: e.close, time: e.time }))}
                height={160}
                width={480}
                period={period}
            />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query } = (context as unknown) as {
        query: {
            exchange: string;
            currency: string;
            asset: string;
            period: string;
            begin: string;
            end: string;
            indicatorInputs: string;
        };
    };
    const { exchange, currency, asset, period, begin, end } = query;
    const analysis = await AnalysisService.get({
        exchange,
        currency,
        asset,
        period: +period,
        begin,
        end,
        indicatorInputs: [],
    });

    const { candles } = analysis;

    return {
        props: {
            period: +period,
            candles,
        },
    };
};

View.propTypes = {
    period: PropTypes.number.isRequired,
    candles: PropTypes.array.isRequired,
};
