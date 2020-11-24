import PropTypes from "prop-types";
import { IPoint } from "../../interfaces/IPoint";
import _ from "lodash";
import CCI from "./CCI";

const IndicatorChart = ({
    name,
    points,
    height,
    period,
    width,
    overboughtZone,
    oversoldZone,
}: {
    name: string;
    points: IPoint[];
    height: number;
    width: number;
    period: number;
    overboughtZone?: number;
    oversoldZone?: number;
}) => {
    return (
        <svg height={height} width={width}>
            {(() => {
                switch (name) {
                    case "cci":
                        return (
                            <CCI
                                points={points}
                                height={height}
                                width={width}
                                period={period}
                                overboughtZone={overboughtZone}
                                oversoldZone={oversoldZone}
                            />
                        );

                    default:
                        break;
                }
            })()}
            {/* <g>
                <line fill="black" stroke="black" strokeWidth="1" x1="0" x2={width} y1={height} y2={height} />
            </g>
            <g>
                <path fill="none" stroke="steelblue" d={path.toString()} />
            </g> */}
        </svg>
    );
};

IndicatorChart.propTypes = {
    name: PropTypes.string.isRequired,
    points: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    period: PropTypes.number.isRequired,
    overboughtZone: PropTypes.number,
    oversoldZone: PropTypes.number,
};

export default IndicatorChart;
