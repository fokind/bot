import PropTypes from "prop-types";
import { IPoint } from "../../interfaces/IPoint";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import { IMACD } from "../../interfaces/indicators/IMACD";

const MACD = ({
    points,
    height,
    period,
    width,
}: {
    points: IPoint[];
    height: number;
    width: number;
    period: number;
}) => {
    const indicatorPoints = points.map(
        (e) =>
            ({
                time: e.time,
                histogram: e.values[0],
                macd: e.values[1],
                trigger: e.values[2],
            } as IMACD),
    );
    const min = _.min(points.map((e) => _.min(e.values)));
    const max = _.max(points.map((e) => _.max(e.values)));
    const scaleValue = d3.scaleLinear([min, max], [height, 0]);

    const first = _.first(indicatorPoints);
    const begin = moment.utc(first.time).toDate();
    const end = moment.utc(_.last(indicatorPoints).time).toDate(); // .add(period, "minute");
    const scaleTime = d3.scaleTime([begin, end], [0, width]);

    const macdPath = d3.path();
    macdPath.moveTo(scaleTime(begin), scaleValue(first.macd));
    indicatorPoints
        .slice(1)
        .forEach((e) => macdPath.lineTo(scaleTime(moment.utc(e.time).toDate()), scaleValue(e.macd)));

    const triggerPath = d3.path();
    triggerPath.moveTo(scaleTime(begin), scaleValue(first.trigger));
    indicatorPoints
        .slice(1)
        .forEach((e) => triggerPath.lineTo(scaleTime(moment.utc(e.time).toDate()), scaleValue(e.trigger)));

    const tickWidth = scaleTime(moment.utc(first.time).add(period, "minutes").toDate());
    const bodyWidth = 0.8;

    return (
        <svg height={height} width={width}>
            {/* <g>
                <line fill="black" stroke="black" strokeWidth="1" x1="0" x2="0" y1="0" y2={height} />
                {scaleValue.ticks().map((e, i) => {
                    const y = scaleValue(e);
                    return <line key={i} fill="black" stroke="black" strokeWidth="1" x1="0" x2="5" y1={y} y2={y} />;
                })}
            </g> */}
            {/* <g>
                <line fill="black" stroke="black" strokeWidth="1" x1="0" x2={width} y1={height} y2={height} />
            </g> */}
            <g>
                {indicatorPoints.map((e, i) => {
                    const x = scaleTime(moment.utc(e.time).toDate()) + tickWidth / 2;
                    return (
                        <rect
                            key={i}
                            fill="black"
                            strokeWidth="0"
                            x={x - (tickWidth / 2) * bodyWidth}
                            y={scaleValue(Math.max(0, e.histogram))}
                            height={Math.abs(scaleValue(e.histogram) - scaleValue(0))}
                            width={tickWidth * bodyWidth}
                        />
                    );
                })}
            </g>
            <path fill="none" stroke="blue" d={macdPath.toString()} />
            <path fill="none" stroke="red" d={triggerPath.toString()} />
        </svg>
    );
};

MACD.propTypes = {
    points: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    period: PropTypes.number.isRequired,
};

export default MACD;
