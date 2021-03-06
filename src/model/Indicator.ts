import { Edm } from "odata-v4-server";
import { IIndicator } from "../service/IndicatorService";

export class Indicator implements IIndicator {
    // некоторые поля временные, для построения индикатора только на основе свечей
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
    public name: string; // из фиксированного списка tulind

    @Edm.Key
    @Edm.String
    public options: string; // должен парситься в массив чисел

    @Edm.Key
    @Edm.String
    public time: string;

    @Edm.Collection(Edm.Double)
    public values: number[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
