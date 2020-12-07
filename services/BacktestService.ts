import { Backtest } from "crypto-backtest";
import { ObjectID } from "mongodb";
import connect from "../utils/connect";
import { ICreateBacktest } from "../interfaces/ICreateBacktest";
import { IBacktest } from "../interfaces/IBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IIndicatorOutput } from "../interfaces/mongodb/IIndicatorOutput";
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
        // валидировать
        // выполнить вычисления
        // собрать полный backtest
        // сохранить в БД получить идентификатор
        // проставить везде связи и сохранить
        // недостаток схемы в том, что сначала нужно было бы сохранить только входные параметры, а затем отдельно вернуть результаты

        const {
            initialBalance,
            fee,
            strategyName,
            strategyCode,
            strategyIndicatorInputs, // JSON, нужно парсить
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
        const backtestService = new Backtest({
            candles,
            strategyCode,
            indicatorInputs: JSON.parse(strategyIndicatorInputs),
            initialBalance,
            stoplossLevel,
            fee,
            trailingStop,
        });
        await backtestService.execute();
        const { roundtrips, maxDrawDown, maxLosingSeriesLength, indicatorOutputs } = backtestService;
        const backtest: IBacktest = {
            exchange,
            currency,
            asset,
            period,
            begin,
            end,
            strategyName,
            strategyCode,
            strategyIndicatorInputs, // JSON, нужно парсить
            stoplossLevel,
            fee,
            initialBalance,
        };
        const backtestId: ObjectID = (await db.collection(collectionName).insertOne(backtest)).insertedId;
        const indicatorKeys = Object.keys(indicatorOutputs);
        await Promise.all(indicatorKeys.map(key => {
            const outputs: IIndicatorOutput[] = indicatorOutputs[key].map(e => Object.assign({}, e, { key, backtestId }));
            return db.collection("indicatorOutput").insertMany(outputs) as Promise<void>;
        }));

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

        return Object.assign(backtest, delta, { _id: backtestId.toHexString() });
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
