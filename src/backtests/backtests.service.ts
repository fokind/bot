import {
    Backtest as BacktestService,
    ICandle,
    Strategy,
} from "crypto-backtest";
import { Injectable } from "@nestjs/common";
import { ObjectID } from "mongodb";
import connect from "../connect";
import { CreateBacktestDto } from "./dto/backtest.dto";
import { IBacktest } from "./interfaces/backtest.interface";

const collectionName = "backtest";

@Injectable()
export class BacktestsService {
    async findAll(): Promise<IBacktest[]> {
        return (await connect())
            .collection<IBacktest>(collectionName)
            .find()
            .toArray();
    }

    async finOne(id: string): Promise<IBacktest> {
        const _id = new ObjectID(id);
        return (await connect())
            .collection<IBacktest>(collectionName)
            .findOne({ _id });
    }

    async create(body: CreateBacktestDto): Promise<IBacktest> {
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
            execute: new Function("data", strategyCode) as (
                data: any,
            ) => string,
            indicatorInputs: JSON.parse(strategyIndicatorInputs),
        });
        const backtestService = new BacktestService({
            candles,
            strategy,
            initialBalance,
            stoplossLevel,
            fee,
        });
        await backtestService.execute();
        const {
            roundtrips,
            maxDrawDown,
            maxLosingSeriesLength,
        } = backtestService;
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
        const backtestId = (
            await db.collection(collectionName).insertOne(backtest)
        ).insertedId;
        backtest._id = backtestId;
        await db
            .collection("roundtrip")
            .insertMany(
                roundtrips.map((e) => Object.assign(e, { backtestId })),
            );
        const balanceItems: any[] = roundtrips.map((e) => ({
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
}
