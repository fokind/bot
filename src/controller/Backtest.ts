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

        const { trades } = backtestService;

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

        let roundtrip: Roundtrip = null;
        const roundtrips: Roundtrip[] = [];

        let peak = initialBalance;
        let maxDrawDown = 0;
        let losingLength = 0;
        let maxLosingSeriesLength = 0;

        trades.forEach((trade) => {
            // если открытого нет, тогда сначала создать
            // предполагается что трейды чередуются, открывающий и закрывающий
            if (!roundtrip) {
                roundtrip = new Roundtrip({
                    begin: trade.time,
                    openPrice: trade.price,
                    openAmount: trade.amount + trade.fee,
                    fee: trade.fee,
                    backtestId,
                });
            } else {
                roundtrip.end = trade.time;
                roundtrip.closePrice = trade.price;
                roundtrip.closeAmount = trade.amount - trade.fee;
                roundtrip.fee = roundtrip.fee + trade.fee;
                roundtrip.profit = roundtrip.closeAmount - roundtrip.openAmount;

                peak = Math.max(peak, roundtrip.closeAmount);

                if (roundtrip.profit > 0) {
                    losingLength = 0;
                } else {
                    maxLosingSeriesLength = Math.max(
                        maxLosingSeriesLength,
                        ++losingLength
                    );
                    maxDrawDown = Math.max(
                        maxDrawDown,
                        1 - roundtrip.closeAmount / peak
                    );
                }

                roundtrips.push(roundtrip);
                roundtrip = null;
            }
        });

        await db.collection("roundtrip").insertMany(roundtrips);

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
                      .sort(mongodbQuery.sort)
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
}
