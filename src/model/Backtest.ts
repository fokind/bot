import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Trade } from "./Trade";

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

    // @Edm.Boolean
    // public stoplossEnabled: boolean;

    @Edm.Double
    public stoplossLevel: number; // доля от цены

    @Edm.Double
    public fee: number; // доля

    @Edm.Double
    public initialBalance: number;

    @Edm.Double
    public finalBalance: number;

    // @Edm.Double
    // public profit: number;

    @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Trade)))
    public Trades: Trade[];

    constructor(data: any) {
        Object.assign(this, data);
    }
}
