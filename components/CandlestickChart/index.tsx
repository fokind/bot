import { ICandle } from "../../interfaces/ICandle";
import { ScaleLinear, ScaleTime } from "d3";
import moment from "moment";

function CandlestickChart({
    candles,
    bodyWidth = 0.8,
    scaleValue,
    scaleTime,
    tickWidth,
}: {
    candles: ICandle[];
    bodyWidth: number;
    scaleValue: ScaleLinear<number, number, number>;
    scaleTime: ScaleTime<number, number, number>;
    tickWidth: number;
}) {
    return (
        <g>
            {" "}
            {scaleValue && scaleTime && tickWidth
                ? candles.map((e, i) => {
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
                  })
                : ""}
        </g>
    );
}

export default CandlestickChart;
