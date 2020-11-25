import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import { IRoundtrip } from "../../interfaces/IRoundtrip";

function RoundtripRect({
    roundtrips,
    scaleValue,
    scaleTime,
    tickWidth,
}: {
    roundtrips: IRoundtrip[];
    scaleValue: d3.ScaleLinear<number, number, number>;
    scaleTime: d3.ScaleTime<number, number, number>;
    tickWidth: number;
}) {
    return (
        <g>
            {roundtrips.map((e, i) => {
                const x1 = scaleTime(moment.utc(e.begin).toDate()) + tickWidth / 2;
                const x2 = scaleTime(moment.utc(e.end).toDate()) + tickWidth / 2;
                const bullish = e.profit > 0;
                return (
                    <g key={i}>
                        <rect
                            fill="none"
                            stroke={bullish ? "green" : "red"}
                            strokeWidth="1"
                            x={x1}
                            y={bullish ? scaleValue(e.closePrice) : scaleValue(e.openPrice)}
                            height={
                                bullish
                                    ? scaleValue(e.openPrice) - scaleValue(e.closePrice)
                                    : scaleValue(e.closePrice) - scaleValue(e.openPrice)
                            }
                            width={x2 - x1}
                        />
                    </g>
                );
            })}
        </g>
    );
}

export default RoundtripRect;
