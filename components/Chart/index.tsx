// import * as d3 from "d3";
// import _ from "lodash";
// import moment from "moment";
import React from "react";

function Chart({
    height,
    width,
    min,
    max,
    begin,
    end,
    period,
    children,
}: {
    height: number;
    width: number;
    min: number;
    max: number;
    begin: Date;
    end: Date;
    period: number;
    children: any[];
}) {
    // const scaleValue = d3.scaleLinear([min, max], [height, 0]);
    // const scaleTime = d3.scaleTime([begin, end], [0, width]);
    // const tickWidth = scaleTime(moment.utc(begin).add(period, "minutes").toDate());

    return (
        <svg height={height} width={width}>
            {children}
            {/* {React.Children.map(children, (child) => {
                console.log(child);
                return React.cloneElement(child, {
                    height,
                    width,
                    scaleValue,
                    scaleTime,
                    tickWidth,
                });
            })} */}
        </svg>
    );
}

export default Chart;
