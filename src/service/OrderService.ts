import { EventEmitter } from "events";
import { ICandle } from "exchange-service";
import moment from "moment";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { BotServer } from "../server";
import { ExchangeService } from "./ExchangeService";
import { BotServer } from "../server";

interface IBalance: {
    currency: string;
  available: number;
  reserved: number;
}

interface IOrder: {
  public _id?: ObjectID;
  public time: string;
  public side: string;
  public quantity: number;
  public price: number;
  public sessionId: ObjectID;
  public active: bool;
}

  async getBalance(currency: string): Promise<IBalance> {
    const db = await connect();
    const collection = db.collection("balance");
    const { currency, available, reserved
} = await collection.findOne(
        {
          currency
        }
    );
    return { currency, available, reserved
};
  }
  
  async setBalance(balance: IBalance): Promise<void> {
      return Promise.reject();
  }
async createTrade({
    sessionId,
    exchange,
    currency,
    asset,
    side,
    price,
    quantity
  }: {
    sessionId: string;
    exchange: string;
    currency: string;
    asset: string;
    side: string;
    price: number;
    quantity: number;
  }): Promise<IOrder> {
          if (side === "buy") {
        this.currencyReserved -= amount;
        this.assetAvailable += quantity;
      } else {
        this.assetReserved -= quantity;
        this.currencyAvailable += amount;
      }

      this.emit("trade", {
        parameters: {
          time: moment.utc().toISOString(),
          side,
          price,
          quantity,
          amount
        }
      });

      this._emitBalance();

}

export async createOrder({
    sessionId,
    exchange,
    currency,
    asset,
    side,
    price,
    quantity
  }: {
    sessionId: string;
    exchange: string;
    currency: string;
    asset: string;
    side: string;
    price: number;
    quantity: number;
  }): Promise<IOrder> {
    if (price <= 0 || quantity <= 0) {
      return Promise.reject();
    }

    const amount = price * quantity; // TODO заменить на более точное вычисление

    switch (side) {
      case "buy":
        const currencyBalance = await getBalance(currency);
        if (amount > currencyBalance.available) {
          return Promise.reject();
        }
        currencyBalance.available -= amount;
        currencyBalance.reserved += amount;
        await setBalance(currencyBalance);
        break;
      case "sell":
    const assetBalance = await getBalance(asset);
        if (quantity > assetBalance.available) {
          return Promise.reject();
        }
        assetBalance.available -= quantity;
        assetBalance.reserved += quantity;
        await setBalance(assetBalance);
        break;
      default:
        return Promise.reject();
    }
    
    const order: IOrder = {
        time: moment.utc().toISOString(),
        side,
        quantity,
        price,
        sessionId: new ObjectID(sessionId),
        active: true
    };

    const db = await connect();
    const collection = await db.collection("order");
    order._id = (await collection.insertOne(order)).insertedId;

    // запланировать трейд
    const TRADE_DELAY = 1;
    setTimeout(() => {
        
    }, TRADE_DELAY);

    // событие успешного создания ордера
    const eventBus = BotServer.eventBus;
    eventBus.emit("order", order);
    
    return order;
  }
}
