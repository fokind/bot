import { Edm } from "odata-v4-server";
import { IndicatorOutput } from "./IndicatorOutput";

export class Indicator {
    @Edm.Key
    @Edm.String
    public exchange: string;

    @Edm.Key
    @Edm.String
    public currency: string;

    @Edm.Key
    @Edm.String
    public asset: string;

    @Edm.Key
    @Edm.Double
    public period: number;

    @Edm.Key
    @Edm.String
    public begin: string;

    @Edm.Key
    @Edm.String
    public end: string;

    @Edm.Key
    @Edm.String
    public name: string; // из фиксированного списка tulind

    @Edm.Key
    @Edm.String
    public options: string; // должен парситься в массив чисел

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorOutput)))
    public Output: IndicatorOutput[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
