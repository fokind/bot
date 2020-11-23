import { Backtest, Strategy } from "crypto-backtest";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { ICreateBacktest } from "../interfaces/ICreateBacktest";
import { IBacktest } from "../interfaces/IBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IBalanceItem } from "../interfaces/IBalanceItem";

const collectionName = "backtest";

export class BacktestService {
    static async findAllIds(): Promise<string[]> {
        return (await connect())
            .collection(collectionName)
            .find()
            .project({
                _id: 1,
            })
            .map((e) => (e._id as ObjectID).toHexString())
            .toArray();
    }

    static async findAll(): Promise<IBacktest[]> {
        return (await connect())
            .collection(collectionName)
            .find()
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                    }) as IBacktest,
            )
            .toArray();
    }

    static async findOne(id: string): Promise<IBacktest> {
        const _id = new ObjectID(id);
        const item = await (await connect()).collection(collectionName).findOne({ _id });
        return Object.assign(item, {
            _id: (item._id as ObjectID).toHexString(),
        }) as IBacktest;
    }

    static async create(body: ICreateBacktest): Promise<IBacktest> {
        const {
            initialBalance,
            fee,
            strategyName,
            strategyWarmup,
            strategyCode,
            strategyIndicatorInputs, // JSON, нужно парсить
            stoplossLevel,
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
        } = body;
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
        const strategy = new Strategy({
            warmup: 1,
            execute: new Function("data", strategyCode) as (data: any) => string,
            indicatorInputs: JSON.parse(strategyIndicatorInputs),
        });
        const backtestService = new Backtest({
            candles,
            strategy,
            initialBalance,
            stoplossLevel,
            fee,
        });
        await backtestService.execute();
        const { roundtrips, maxDrawDown, maxLosingSeriesLength } = backtestService;
        const backtest: IBacktest = {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            strategyName,
            strategyWarmup,
            strategyCode,
            strategyIndicatorInputs, // JSON, нужно парсить
            stoplossLevel,
            fee,
            initialBalance,
        };
        const backtestId: ObjectID = (await db.collection(collectionName).insertOne(backtest)).insertedId;
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
        const winningTradesCount = roundtrips.filter((e) => e.profit > 0).length;
        const losingTradesCount = tradesCount - winningTradesCount;
        const delta = {
            finalBalance: tradesCount ? roundtrips[tradesCount - 1].closeAmount : initialBalance,
            maxDrawDown,
            maxLosingSeriesLength,
            tradesCount,
            winningTradesCount,
            losingTradesCount,
            winningTradesPercentage: winningTradesCount / tradesCount,
            losingTradesPercentage: losingTradesCount / tradesCount,
        };
        await db.collection(collectionName).updateOne(
            { _id: backtestId },
            {
                $set: delta,
            },
        );
        backtest._id = backtestId.toHexString();
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
            .sort({ time: 1 })
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                    }) as ICandle,
            )
            .toArray();

        return items;
    }

    static async findRoundtrips(backtestId: string): Promise<IRoundtrip[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const collection = db.collection("roundtrip");
        const items: IRoundtrip[] = await collection
            .find({
                backtestId: _id,
            })
            .sort({ time: 1 })
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                        backtestId: (e.backtestId as ObjectID).toHexString(),
                    }) as IRoundtrip,
            )
            .toArray();

        return items;
    }

    static async findBalance(backtestId: string): Promise<IBalanceItem[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const collection = db.collection("balance");
        const items: IBalanceItem[] = await collection
            .find({
                backtestId: _id,
            })
            .sort({ time: 1 })
            .map(
                (e) =>
                    Object.assign(e, {
                        _id: (e._id as ObjectID).toHexString(),
                        backtestId: (e.backtestId as ObjectID).toHexString(),
                    }) as IBalanceItem,
            )
            .toArray();

        return items;
    }
}
