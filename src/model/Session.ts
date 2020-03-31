import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import { SessionService } from "../service/SessionService";
import { Balance } from "./Balance";
import { Candle } from "./Candle";
import { Order } from "./Order";
import { Ticker } from "./Ticker";
import { Trade } from "./Trade";

export class Session {
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

  @Edm.Double
  public period: number;

  @Edm.Double
  public initialBalance: number;
  // TODO добавить ссылку на модель баланса
  // при старте туда прописывается это поле
  // при остановке формируется окончательный баланс
  // в процессе estimateBalance
  // модель баланса содержит ключ в виде валюты и др.
  // содержит доступное и зарезервированное количество
  // данные берутся из сервиса биржи, в режиме эмуляции из памяти, в реальном режиме с реальной биржи
  // сначала меняется баланс и формируется событие, затем формируется трейд, затем закрывается ордер
  // если сначала закрывается ордер, то можно создать новый, а данные по балансу будут некорректны

  @Edm.String
  public begin: string;

  @Edm.String
  public end: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Order)))
  public Orders: Order[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Trade)))
  public Trades: Trade[];

  @Edm.EntityType(Edm.ForwardRef(() => Ticker))
  public Ticker: Ticker;

  @Edm.EntityType(Edm.ForwardRef(() => Balance))
  public CurrencyBalance: Balance;

  @Edm.EntityType(Edm.ForwardRef(() => Balance))
  public AssetBalance: Balance;

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Edm.Action
  public async start(@odata.result result: any): Promise<void> {
    SessionService.start(result._id);
  }

  @Edm.Action
  public async stop(@odata.result result: any): Promise<void> {
    SessionService.stop(result._id);
  }

  @Edm.Action
  public async buy(@odata.result result: any): Promise<void> {
    SessionService.buy(result._id);
  }

  @Edm.Action
  public async sell(@odata.result result: any): Promise<void> {
    SessionService.sell(result._id);
  }

  @Edm.Action
  public async createOrder(
    @odata.result result: any,
    @odata.body
    body: {
      side: string;
      price: number;
      quantity: number;
    }
  ): Promise<void> {
    await SessionService.createOrder(result._id, body);
    // простое создание ордера, т.к. покупка подразумевает сложную тактику
  }
}
