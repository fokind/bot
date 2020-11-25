import * as d3 from "d3";
import _ from "lodash";
import moment from "moment";
import { IRoundtrip } from "../../interfaces/IRoundtrip";

function RoundtripLine({
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
    const first = _.first(roundtrips);
    const begin = moment.utc(first.begin).toDate();
    const path0 = d3.path();

    path0.moveTo(scaleTime(begin), scaleValue(first.openPrice));
    path0.lineTo(scaleTime(moment.utc(first.end).toDate()), scaleValue(first.closePrice));
    roundtrips.slice(1).forEach((e) => {
        path0.moveTo(scaleTime(moment.utc(e.begin).toDate()), scaleValue(e.openPrice));
        path0.lineTo(scaleTime(moment.utc(e.end).toDate()), scaleValue(e.closePrice));
    });

    const path1 = d3.path();
    path1.moveTo(scaleTime(moment.utc(first.end).toDate()), scaleValue(first.closePrice));
    roundtrips.slice(1).forEach((e) => {
        path1.lineTo(scaleTime(moment.utc(e.begin).toDate()), scaleValue(e.openPrice));
        path1.moveTo(scaleTime(moment.utc(e.end).toDate()), scaleValue(e.closePrice));
    });

    return (
        <g>
            <path fill="none" stroke="green" d={path0.toString()} />
            <path fill="none" stroke="red" d={path1.toString()} />
        </g>
    );
}

export default RoundtripLine;
