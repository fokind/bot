import { IIndicatorInput } from "./IIndicatorInput";
import { IIndicatorOutput } from "./IIndicatorOutput";

export interface IIndicator extends IIndicatorInput {
    output: IIndicatorOutput[];
}
