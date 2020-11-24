import PropTypes from "prop-types";
import { IPoint } from "../../interfaces/IPoint";
import { ICCI } from "../../interfaces/indicators/ICCI";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";

const CCI = ({
    points,
    height,
    period,
    width,
    overboughtZone,
    oversoldZone,
}: {
    points: IPoint[];
    height: number;
    width: number;
    period: number;
    overboughtZone?: number;
    oversoldZone?: number;
}) => {
    const indicatorPoints = points.map(
        (e) =>
            ({
                time: e.time,
                value: e.values[0],
            } as ICCI),
    );
    const min = _.min(indicatorPoints.map((e) => e.value));
    const max = _.max(indicatorPoints.map((e) => e.value));
    const scaleValue = d3.scaleLinear([min, max], [height, 0]);
    const first = _.first(indicatorPoints);
    const begin = moment.utc(first.time).toDate();
    const end = moment.utc(_.last(indicatorPoints).time).add(period, "minutes").toDate();
    const scaleTime = d3.scaleTime([begin, end], [0, width]);
    const tickWidth = scaleTime(moment.utc(first.time).add(period, "minutes").toDate());
    const bodyWidth = 0.8;

    return (
        <g>
            {indicatorPoints.map((e, i) => {
                const x = scaleTime(moment.utc(e.time).toDate()) + tickWidth / 2;
                const bullish = overboughtZone && e.value >= overboughtZone;
                const bearish = oversoldZone && e.value <= oversoldZone;
                let fill;
                if (bullish) {
                    fill = "green";
                } else if (bearish) {
                    fill = "red";
                } else {
                    fill = "black";
                }

                return (
                    <rect
                        key={i}
                        fill={fill}
                        strokeWidth="0"
                        x={x - (tickWidth / 2) * bodyWidth}
                        y={scaleValue(Math.max(0, e.value))}
                        height={Math.abs(scaleValue(e.value) - scaleValue(0))}
                        width={tickWidth * bodyWidth}
                    />
                );
            })}
        </g>
    );
};

CCI.propTypes = {
    points: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    period: PropTypes.number.isRequired,
    overboughtZone: PropTypes.number,
    oversoldZone: PropTypes.number,
};

export default CCI;
