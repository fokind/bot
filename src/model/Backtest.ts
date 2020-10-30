import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Roundtrip } from "./Roundtrip";

export class Backtest {
    @Edm.Key
    @Edm.Computed
    @Edm.String
    public _id: ObjectID;

    @Edm.String
    public exchange: string;

    @Edm.String
    public currency: string;

    @Edm.String
    public asset: string;

    @Edm.Int32
    public period: number;

    @Edm.String
    public begin: string;

    @Edm.String
    public end: string;

    @Edm.String
    public strategyName: string; // для идентификаии пользователем

    @Edm.Int32
    public strategyWarmup: number; // минимальное число точек для расчета

    @Edm.String
    public strategyCode: string; // (data: StrategyExecuteData[]) => string;
    // StrategyExecuteData: {
    //   time: string;
    //   candle: ICandle;
    //   indicators: Array<{
    //       key: string;
    //       outputs: number[];
    //   }>;
    // }

    @Edm.String
    public strategyIndicatorInputs: string; // Array<{ key: string; name: string; options: number[]; }>;

    @Edm.Double
    public stoplossLevel: number; // доля от цены

    @Edm.Double
    public fee: number; // доля

    @Edm.Double
    public initialBalance: number;

    @Edm.Double
    public finalBalance: number;

    @Edm.Double
    public maxDrawDown: number;

    @Edm.Double
    public tradesCount: number;

    @Edm.Double
    public winningTradesCount: number;

    @Edm.Double
    public losingTradesCount: number;

    @Edm.Double
    public winningTradesPercentage: number;

    @Edm.Double
    public losingTradesPercentage: number;

    @Edm.Int32
    public maxLosingSeriesLength: number;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Roundtrip)))
    public Roundtrips: Roundtrip[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
