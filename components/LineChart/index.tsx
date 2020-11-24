import PropTypes from "prop-types";
import { IPoint } from "../../interfaces/IPoint";
import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";

const LineChart = ({
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
    const min = _.min(points.map((e) => e.values[0]));
    const max = _.max(points.map((e) => e.values[0]));
    const scaleValue = d3.scaleLinear([min, max], [height, 0]);

    const first = _.first(points);
    const begin = moment.utc(first.time).toDate();
    const end = moment.utc(_.last(points).time).toDate(); // .add(period, "minute");
    const scaleTime = d3.scaleTime([begin, end], [0, width]);

    const path = d3.path();
    path.moveTo(scaleTime(begin), scaleValue(first.values[0]));
    points.slice(1).forEach((e) => path.lineTo(scaleTime(moment.utc(e.time).toDate()), scaleValue(e.values[0])));

    return (
        <svg height={height} width={width}>
            <g>
                <line fill="black" stroke="black" strokeWidth="1" x1="0" x2="0" y1="0" y2={height} />
                {scaleValue.ticks().map((e, i) => {
                    const y = scaleValue(e);
                    return <line key={i} fill="black" stroke="black" strokeWidth="1" x1="0" x2="5" y1={y} y2={y} />;
                })}
            </g>
            <g>
                <line fill="black" stroke="black" strokeWidth="1" x1="0" x2={width} y1={height} y2={height} />
            </g>
            <g>
                <path fill="none" stroke="steelblue" d={path.toString()} />
            </g>
        </svg>
    );
};

LineChart.propTypes = {
    points: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    period: PropTypes.number.isRequired,
};

export default LineChart;
