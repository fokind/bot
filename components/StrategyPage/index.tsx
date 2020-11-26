import { IIdealBacktest } from "../../interfaces/IIdealBacktest";
import { ICandle } from "../../interfaces/ICandle";
import CandlestickChart from "../../components/CandlestickChart";
import IndicatorChart from "../../components/IndicatorChart";
import { IRoundtrip } from "../../interfaces/IRoundtrip";
import _ from "lodash";
import { IIndicator } from "../../interfaces/IIndicator";
import { useEffect, useRef, useState } from "react";
import { Container, Row, Column } from "fundamental-react/lib/LayoutGrid";
import FormItem from "fundamental-react/lib/Forms/FormItem";
import FormLabel from "fundamental-react/lib/Forms/FormLabel";
import FormTextarea from "fundamental-react/lib/Forms/FormTextarea";
import { Button } from "fundamental-react/lib/Button";
import "fundamental-styles";

export default function StrategyPage({
    backtest,
    candles,
    roundtrips,
    indicators,
    buy,
    sell,
    onChangeBuy,
    onChangeSell,
    onSave,
}: {
    backtest: IIdealBacktest;
    candles: ICandle[];
    roundtrips: IRoundtrip[];
    indicators: IIndicator[];
    buy: string;
    sell: string;
    onChangeBuy: (buy: string) => void;
    onChangeSell: (sell: string) => void;
    onSave: () => void;
}) {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        setWidth(ref.current ? ref.current.offsetWidth : 0);
    }, [ref.current]);

    return (
        <Container className="docs-layout-grid">
            <Row>
                <Column className="docs-col--2" span={2}>
                    <div className="col-content">
                        {/* <FormItem>
                            <FormLabel htmlFor="textarea-warmup">Условие покупки:</FormLabel>
                            <FormTextarea id="textarea-warmup" placeholder="return: true;" value={warmup} />
                        </FormItem> */}
                        <FormItem>
                            <FormLabel htmlFor="textarea-buy">Условие покупки:</FormLabel>
                            <FormTextarea
                                id="textarea-buy"
                                placeholder="return: true;"
                                value={buy}
                                onChange={(event) => {
                                    onChangeBuy(event.target.value);
                                }}
                            />
                        </FormItem>
                        <FormItem>
                            <FormLabel htmlFor="textarea-sell">Условие продажи:</FormLabel>
                            <FormTextarea
                                id="textarea-sell"
                                placeholder="return: true;"
                                value={sell}
                                onChange={(event) => {
                                    onChangeSell(event.target.value);
                                }}
                            />
                        </FormItem>
                        <Button onClick={onSave}>Сохранить</Button>
                    </div>
                </Column>
                <Column className="docs-col--10" span={10}>
                    <div ref={ref} className="col-content">
                        <CandlestickChart
                            candles={candles}
                            height={480}
                            width={width}
                            period={backtest.period}
                            roundtrips={roundtrips}
                        />
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
