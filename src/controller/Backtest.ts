import {
    Backtest as BacktestService,
    ICandle,
    Strategy,
} from "crypto-backtest";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Backtest } from "../model/Backtest";
import { Balance } from "../model/Balance";
import { Candle } from "../model/Candle";
import { Indicator } from "../model/Indicator";
import { Roundtrip } from "../model/Roundtrip";

const collectionName = "backtest";

@odata.type(Backtest)
@Edm.EntitySet("Backtests")
export class BacktestController extends ODataController {
    @odata.GET
    public async get(
        @odata.query query: ODataQuery
    ): Promise<Backtest[] & { inlinecount?: number }> {
        const db = await connect();
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const result: Backtest[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await db
                      .collection(collectionName)
                      .find(mongodbQuery.query)
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new Backtest(e))
                      .toArray();

        if (mongodbQuery.inlinecount) {
            result.inlinecount = await db
                .collection(collectionName)
                .find(mongodbQuery.query)
                .project(mongodbQuery.projection)
                .count(false);
        }
        return result;
    }

    @odata.GET
    public async getById(
        @odata.key key: string,
        @odata.query query: ODataQuery
    ): Promise<Backtest> {
        const { projection } = createQuery(query);
        // tslint:disable-next-line: variable-name
        const _id = new ObjectID(key);
        const db = await connect();
        return new Backtest(
            await db.collection(collectionName).findOne({ _id }, { projection })
        );
    }

    @odata.POST
    public async post(
        @odata.body
        body: any
    ): Promise<Backtest> {
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
                data: any
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

        const backtest = new Backtest({
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
        });

        const backtestId = (
            await db.collection(collectionName).insertOne(backtest)
        ).insertedId;

        backtest._id = backtestId;

        await db
            .collection("roundtrip")
            .insertMany(
                roundtrips.map((e) => Object.assign(e, { backtestId }))
            );

        const balanceItems: Balance[] = roundtrips.map(
            (e) =>
                new Balance({
                    time: e.end,
                    available: e.closeAmount,
                    backtestId,
                })
        );

        balanceItems.unshift(
            new Balance({
                time: begin,
                available: initialBalance,
                backtestId,
            })
        );

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
            }
        );

        Object.assign(backtest, delta);

        return backtest;
    }

    @odata.PATCH
    public async patch(
        @odata.key key: string,
        @odata.body delta: any
    ): Promise<number> {
        if (delta._id) {
            delete delta._id;
        }
        // tslint:disable-next-line: variable-name
        const _id = new ObjectID(key);
        return (await connect())
            .collection(collectionName)
            .updateOne({ _id }, { $set: delta })
            .then((result) => result.modifiedCount);
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        // tslint:disable-next-line: variable-name
        const _id = new ObjectID(key);
        return (await connect())
            .collection(collectionName)
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }

    @odata.GET("Candles")
    public async getCandles(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Candle[] & { inlinecount?: number }> {
        const { exchange, currency, asset, period, begin, end } = result;

        const db = await connect();
        const collection = db.collection("candle");
        const mongodbQuery = createQuery(query);
        const findQuery = {
            $and: [
                {
                    exchange,
                    currency,
                    asset,
                    period,
                    time: { $gte: begin, $lte: end },
                },
                mongodbQuery.query,
            ],
        };
        const items: Candle[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find(findQuery)
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(Object.assign({ time: 1 }, mongodbQuery.sort))
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection
                .find(findQuery)
                .project(mongodbQuery.projection)
                .count(false);
        }
        return items;
    }

    @odata.GET("Roundtrips")
    public async getRoundtrips(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Roundtrip[] & { inlinecount?: number }> {
        const backtestId = new ObjectID(result._id);
        const db = await connect();
        const collection = db.collection("roundtrip");
        const mongodbQuery = createQuery(query);
        const items: Roundtrip[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  backtestId,
                              },
                              mongodbQuery.query,
                          ],
                      })
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(Object.assign({ begin: 1 }, mongodbQuery.sort))
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection
                .find({
                    $and: [
                        {
                            backtestId,
                        },
                        mongodbQuery.query,
                    ],
                })
                .project(mongodbQuery.projection)
                .count(false);
        }
        return items;
    }

    @odata.GET("BalanceHistory")
    public async getBalanceHistory(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Balance[] & { inlinecount?: number }> {
        const backtestId = new ObjectID(result._id);
        const db = await connect();
        const collection = db.collection("balance");
        const mongodbQuery = createQuery(query);
        const items: Balance[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  backtestId,
                              },
                              mongodbQuery.query,
                          ],
                      })
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(Object.assign({ time: 1 }, mongodbQuery.sort))
                      .toArray();
        if (mongodbQuery.inlinecount) {
            items.inlinecount = await collection
                .find({
                    $and: [
                        {
                            backtestId,
                        },
                        mongodbQuery.query,
                    ],
                })
                .project(mongodbQuery.projection)
                .count(false);
        }
        return items;
    }

    @odata.GET("Indicators")
    public async getIndicators(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<Indicator[] & { inlinecount?: number }> {
        // запросить свечи
        // преобразовать в индикаторы
        // а еще лучше взять из базы данных уже посчитанные для бэктеста
        // хотя может и не лучше, быстро закончится место на диске
        return [];
    }
}
