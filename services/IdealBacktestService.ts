import { IdealBacktest } from "crypto-backtest";
import { ObjectID } from "mongodb";
import connect from "../utils/connect";
import { ICreateIdealBacktest } from "../interfaces/ICreateIdealBacktest";
import { IIdealBacktest } from "../interfaces/IIdealBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IBalanceItem } from "../interfaces/IBalanceItem";

const collectionName = "idealBacktest";

export class IdealBacktestService {
    static async findAll(): Promise<IIdealBacktest[]> {
        return (await connect())
            .collection(collectionName)
            .find()
            .map((e) => {
                const {
                    _id,
                    exchange,
                    currency,
                    asset,
                    period,
                    begin,
                    end,
                    fee,
                    initialBalance,
                    finalBalance,
                    tradesCount,
                    candlesCount,
                }: IIdealBacktest = e;
                return {
                    _id: (_id as ObjectID).toHexString(),
                    exchange,
                    currency,
                    asset,
                    period,
                    begin,
                    end,
                    fee,
                    initialBalance,
                    finalBalance,
                    tradesCount,
                    candlesCount,
                };
            })
            .toArray();
    }

    static async findOne(id: string): Promise<IIdealBacktest> {
        const _id = new ObjectID(id);
        const {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            fee,
            initialBalance,
            finalBalance,
            tradesCount,
        }: IIdealBacktest = await (await connect()).collection(collectionName).findOne({ _id });
        // TODO временно
        const { length: candlesCount } = await (await connect())
            .collection("candle")
            .find({
                exchange,
                currency,
                asset,
                period,
                time: { $gte: begin, $lte: end },
            })
            .toArray();

        return {
            _id: (_id as ObjectID).toHexString(),
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            fee,
            initialBalance,
            finalBalance,
            tradesCount,
            candlesCount,
        };
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

        backtest.candlesCount = candles.length;
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
