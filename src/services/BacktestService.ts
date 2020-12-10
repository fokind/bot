import { ObjectID } from "mongodb";
import { Backtest } from "crypto-backtest";
import { ICandle } from "../interfaces/ICandle";
import connect from "../connect";
import { IBacktest } from "../interfaces/IBacktest";
import { ICreateBacktest } from "../interfaces/ICreateBacktest";
// import { IBalanceItem } from "../interfaces/IBalanceItem";

const collectionName = "backtest";

export class BacktestService {
    static async create(body: ICreateBacktest): Promise<IBacktest> {
        // валидировать
        const {
            initialBalance,
            fee,
            strategyName,
            strategyCode,
            indicatorInputs,
            stoplossLevel,
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            trailingStop,
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

        // выполнить вычисления
        const backtestService = new Backtest({
            candles,
            strategyCode,
            indicatorInputs,
            initialBalance,
            stoplossLevel,
            fee,
            trailingStop,
        });

        const {
            roundtrips,
            maxDrawDown,
            maxLosingSeriesLength,
            indicatorOutputs,
        } = await backtestService.execute();

        const backtest: IBacktest = {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            strategyName,
            strategyCode,
            indicatorInputs,
            stoplossLevel,
            fee,
            trailingStop,
            initialBalance,
        };

        // собрать полный backtest
        const tradesCount = roundtrips.length;
        const winningTradesCount = roundtrips.filter((e) => e.profit > 0)
            .length;
        const losingTradesCount = tradesCount - winningTradesCount;

        const delta = {
            finalBalance: tradesCount
                ? roundtrips[tradesCount - 1].closeAmount
                : initialBalance,
            maxDrawDown,
            maxLosingSeriesLength,
            tradesCount,
            winningTradesCount,
            losingTradesCount,
            winningTradesPercentage: winningTradesCount / tradesCount,
            losingTradesPercentage: losingTradesCount / tradesCount,
            roundtrips,
            indicatorOutputs,
        };

        Object.assign(backtest, delta);

        // сохранить в БД получить идентификатор
        const backtestId: ObjectID = (
            await db.collection(collectionName).insertOne(backtest)
        ).insertedId;

        backtest._id = backtestId.toHexString();

        // проставить везде связи и сохранить
        // индикаторы

        // const balanceItems: IBalanceItem[] = roundtrips.map((e) => ({
        //     time: e.end,
        //     available: e.closeAmount,
        // }));

        // balanceItems.unshift({
        //     time: begin,
        //     available: initialBalance,
        //     backtestId,
        // });

        // await db.collection("balance").insertMany(balanceItems);

        return backtest;
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
        const item = await (await connect())
            .collection(collectionName)
            .findOne({ _id });
        return Object.assign(item, {
            _id: (item._id as ObjectID).toHexString(),
        }) as IBacktest;
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
}
