import PropTypes from "prop-types";
import { ICandle } from "../../interfaces/ICandle";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import { IRoundtrip } from "../../interfaces/IRoundtrip";

// TODO roundtrips

const CandlestickChart = ({
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
}) => {
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
            <g>
                {roundtrips
                    ? roundtrips.map((e, i) => {
                          const x1 = scaleTime(moment.utc(e.begin).toDate()) + tickWidth / 2;
                          const x2 = scaleTime(moment.utc(e.end).toDate()) + tickWidth / 2;
                          const bullish = e.profit > 0;
                          return (
                              <g key={i}>
                                  <rect
                                      fill="none"
                                      stroke={bullish ? "green" : "red"}
                                      strokeWidth={1}
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
                      })
                    : ""}
            </g>
            <g>
                {candles.map((e, i) => {
                    const x = scaleTime(moment.utc(e.time).toDate()) + tickWidth / 2;
                    const bullish = e.close >= e.open;
                    return (
                        <g key={i}>
                            <line
                                fill={bullish ? "green" : "red"}
                                stroke={bullish ? "green" : "red"}
                                strokeWidth={1}
                                x1={x}
                                x2={x}
                                y1={scaleValue(e.low)}
                                y2={scaleValue(e.high)}
                            />
                            <rect
                                fill={bullish ? "green" : "red"}
                                stroke={bullish ? "green" : "red"}
                                strokeWidth={0}
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
};

CandlestickChart.propTypes = {
    candles: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    period: PropTypes.number.isRequired,
    roundtrips: PropTypes.array,
};

export default CandlestickChart;
