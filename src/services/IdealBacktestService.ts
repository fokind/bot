import { IdealBacktest } from "crypto-backtest";
import { Injectable } from "@nestjs/common";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { CreateIdealBacktestDto } from "../dto/CreateIdealBacktestDto";
import { IIdealBacktest } from "../interfaces/IIdealBacktest";
import { ICandle } from "../interfaces/ICandle";
import { IRoundtrip } from "../interfaces/IRoundtrip";
import { IBalanceItem } from "../interfaces/IBalanceItem";

const collectionName = "idealBacktest";

@Injectable()
export class IdealBacktestService {
    async findAll(): Promise<IIdealBacktest[]> {
        return (await connect())
            .collection<IIdealBacktest>(collectionName)
            .find()
            .toArray();
    }

    async findOne(id: string): Promise<IIdealBacktest> {
        const _id = new ObjectID(id);
        return (await connect())
            .collection<IIdealBacktest>(collectionName)
            .findOne({ _id });
    }

    async create(body: CreateIdealBacktestDto): Promise<IIdealBacktest> {
        const {
            initialBalance,
            fee,
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

        const backtestId = (
            await db.collection(collectionName).insertOne(backtest)
        ).insertedId;

        backtest._id = backtestId;

        await db
            .collection("roundtrip")
            .insertMany(
                roundtrips.map((e) => Object.assign(e, { backtestId })),
            );

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
            finalBalance: tradesCount
                ? roundtrips[tradesCount - 1].closeAmount
                : initialBalance,
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

    async findCandles(backtestId: string): Promise<ICandle[]> {
        const _id = new ObjectID(backtestId);
        const db = await connect();
        const backtest = await db
            .collection<IIdealBacktest>(collectionName)
            .findOne({ _id });

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
