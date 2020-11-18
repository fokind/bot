import { IdealBacktest } from "crypto-backtest";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { ICreateIdealBacktest } from "../interfaces/ICreateIdealBacktest";
import { IIdealBacktest } from "../interfaces/IIdealBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IBalanceItem } from "../interfaces/IBalanceItem";

const collectionName = "idealBacktest";

export class IdealBacktestService {
    static async findAll(): Promise<IIdealBacktest[]> {
        return (await connect()).collection(collectionName).find().toArray();
    }

    static async findOne(id: string): Promise<IIdealBacktest> {
        const _id = new ObjectID(id);
        return (await connect()).collection(collectionName).findOne({ _id });
    }

    static async create(body: ICreateIdealBacktest): Promise<IIdealBacktest> {
        const { initialBalance, fee, exchange, currency, asset, period, begin, end } = body;

        const db = await connect();
        const candles: ICandle[] = await db
            .collection("candle")
            .find({
                exchange,
                currency,
                asset,
                period,
                time: { $gte: begin, $lte: end },
            })
            .sort({ time: 1 })
            .toArray();

        const backtestService = new IdealBacktest({
            candles,
            initialBalance,
            fee,
        });

        backtestService.execute();

        const { roundtrips } = backtestService;

        const backtest: IIdealBacktest = {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            fee,
            initialBalance,
        };

        const backtestId = (await db.collection(collectionName).insertOne(backtest)).insertedId;

        backtest._id = backtestId;

        await db.collection("roundtrip").insertMany(roundtrips.map((e) => Object.assign(e, { backtestId })));

        const balanceItems: IBalanceItem[] = roundtrips.map((e) => ({
            time: e.end,
            available: e.closeAmount,
            backtestId,
        }));

        balanceItems.unshift({
            time: begin,
            available: initialBalance,
            backtestId,
        });

        await db.collection("balance").insertMany(balanceItems);

        const tradesCount = roundtrips.length;
        const delta = {
            finalBalance: tradesCount ? roundtrips[tradesCount - 1].closeAmount : initialBalance,
            tradesCount,
        };

        await db.collection(collectionName).updateOne(
            { _id: backtestId },
            {
                $set: delta,
            },
        );

        Object.assign(backtest, delta);

        return backtest;
    }

    static async findCandles(backtestId: string): Promise<ICandle[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const backtest = await db.collection(collectionName).findOne({ _id });

        const { exchange, currency, asset, period, begin, end } = backtest;

        const collection = db.collection("candle");
        const findQuery = {
            exchange,
            currency,
            asset,
            period,
            time: { $gte: begin, $lte: end },
        };

        const items: ICandle[] = await collection
            .find(findQuery)
            .sort(Object.assign({ time: 1 }))
            .toArray();

        return items;
    }

    async findRoundtrips(backtestId: string): Promise<IRoundtrip[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const collection = db.collection("roundtrip");
        const items: IRoundtrip[] = await collection
            .find({
                backtestId: _id,
            })
            .sort(Object.assign({ time: 1 }))
            .toArray();

        return items;
    }

    async findBalance(backtestId: string): Promise<IBalanceItem[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const collection = db.collection("balance");
        const items: IBalanceItem[] = await collection
            .find({
                backtestId: _id,
            })
            .sort(Object.assign({ time: 1 }))
            .toArray();

        return items;
    }
}
