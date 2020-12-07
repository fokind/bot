import { IBacktest } from "../../interfaces/IBacktest";
import { ICandle } from "../../interfaces/ICandle";
import CandlestickChart from "../../components/CandlestickChart";
import RoundtripLine from "../../components/CandlestickChart/RoundtripLine";
import IndicatorChart from "../../components/IndicatorChart";
import Chart from "../../components/Chart";
import { IRoundtrip } from "../../interfaces/IRoundtrip";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import { IIndicator } from "../../interfaces/IIndicator";
import { useEffect, useRef, useState } from "react";
import { Container, Row, Column } from "fundamental-react/lib/LayoutGrid";
import FormItem from "fundamental-react/lib/Forms/FormItem";
import FormLabel from "fundamental-react/lib/Forms/FormLabel";
import FormTextarea from "fundamental-react/lib/Forms/FormTextarea";
import { Button } from "fundamental-react/lib/Button";
import "fundamental-styles";

export default function BacktestPage({
    backtest,
    candles,
    roundtrips,
    indicators,
    onChangeStrategyCode,
    onSubmit,
}: {
    backtest: IBacktest;
    candles: ICandle[];
    roundtrips: IRoundtrip[];
    indicators: IIndicator[];
    onChangeStrategyCode: (strategyCode: string) => void;
    onSubmit: () => void;
}) {
    console.log(backtest);
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    const height = 480;
    const { period } = backtest;

    useEffect(() => {
        setWidth(ref.current ? ref.current.offsetWidth : 0);
    }, [ref.current]);

    const min = _.min(candles.map((e) => e.low));
    const max = _.max(candles.map((e) => e.high));
    const first = _.first(candles);
    const begin = moment.utc(first.time).toDate();
    const end = moment.utc(_.last(candles).time).add(period, "minutes").toDate();

    // FIXME неправильно, нужно перенести в Chart
    const scaleValue = d3.scaleLinear([min, max], [height, 0]);
    const scaleTime = d3.scaleTime([begin, end], [0, width]);
    const tickWidth = scaleTime(moment.utc(begin).add(period, "minutes").toDate());

    return (
        <Container className="docs-layout-grid">
            <Row>
                <Column className="docs-col--2" span={2}>
                    <div className="col-content">
                        <FormItem>
                            <FormLabel htmlFor="textarea-buy">Стратегия:</FormLabel>
                            <FormTextarea
                                id="textarea-buy"
                                placeholder="return: true;"
                                rows={10}
                                value={backtest.strategyCode}
                                onChange={(event) => {
                                    onChangeStrategyCode(event.target.value);
                                }}
                            />
                        </FormItem>
                        <Button onClick={onSubmit}>Сохранить</Button>
                    </div>
                </Column>
                <Column className="docs-col--10" span={10}>
                    <div ref={ref} className="col-content">
                        <Chart
                            height={height}
                            width={width}
                            min={min}
                            max={max}
                            begin={begin}
                            end={end}
                            period={period}
                        >
                            (
                            <CandlestickChart
                                candles={candles}
                                bodyWidth={0.8}
                                scaleValue={scaleValue}
                                scaleTime={scaleTime}
                                tickWidth={tickWidth}
                            />
                            {roundtrips ? (
                                <RoundtripLine
                                    roundtrips={roundtrips}
                                    scaleValue={scaleValue}
                                    scaleTime={scaleTime}
                                    tickWidth={tickWidth}
                                />
                            ) : (
                                ""
                            )}
                            )
                        </Chart>
                        <div>
                            {indicators.map((e, i) => (
                                <IndicatorChart
                                    key={i}
                                    name={e.name}
                                    points={e.output.map((e) => ({
                                        time: e.time,
                                        values: e.values,
                                    }))}
                                    height={120}
                                    width={width}
                                    period={backtest.period}
                                    overboughtZone={100}
                                    oversoldZone={-100}
                                />
                            ))}
                        </div>
                    </div>
                </Column>
            </Row>
        </Container>
    );
}
