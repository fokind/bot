import { ICandle } from "../../interfaces/ICandle";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import { IRoundtrip } from "../../interfaces/IRoundtrip";
import RoundtripLine from "./RoundtripLine";

function CandlestickChart({
    candles,
    height,
    period,
    width,
    roundtrips,
}: {
    candles: ICandle[];
    height: number;
    width: number;
    period: number;
    roundtrips?: IRoundtrip[];
}) {
    const min = _.min(candles.map((e) => e.low));
    const max = _.max(candles.map((e) => e.high));
    const scaleValue = d3.scaleLinear([min, max], [height, 0]);
    const first = _.first(candles);
    const begin = moment.utc(first.time).toDate();
    const end = moment.utc(_.last(candles).time).add(period, "minutes").toDate();
    const scaleTime = d3.scaleTime([begin, end], [0, width]);
    const tickWidth = scaleTime(moment.utc(first.time).add(period, "minutes").toDate());
    const bodyWidth = 0.8;

    return (
        <svg height={height} width={width}>
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
            <g>
                {candles.map((e, i) => {
                    const x = scaleTime(moment.utc(e.time).toDate()) + tickWidth / 2;
                    const bullish = e.close >= e.open;
                    return (
                        <g key={i}>
                            <line
                                fill={bullish ? "green" : "red"}
                                stroke={bullish ? "green" : "red"}
                                strokeWidth="1"
                                x1={x}
                                x2={x}
                                y1={scaleValue(e.low)}
                                y2={scaleValue(e.high)}
                            />
                            <rect
                                fill={bullish ? "green" : "red"}
                                strokeWidth="0"
                                x={x - (tickWidth / 2) * bodyWidth}
                                y={bullish ? scaleValue(e.close) : scaleValue(e.open)}
                                height={
                                    bullish
                                        ? scaleValue(e.open) - scaleValue(e.close)
                                        : scaleValue(e.close) - scaleValue(e.open)
                                }
                                width={tickWidth * bodyWidth}
                            />
                        </g>
                    );
                })}
            </g>
        </svg>
    );
}

export default CandlestickChart;
