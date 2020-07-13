import { ExchangeService, ICandle } from "exchange-service";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { IndicatorStream } from "../model/IndicatorStream";
import { IndicatorStreamInput } from "../model/IndicatorStreamInput";
import { IndicatorService } from "../service/IndicatorService";

const collectionName = "indicatorStream";

function setActive(indicatorStream: IndicatorStream): IndicatorStream {
    indicatorStream.active = !!IndicatorStream._instances.find((e) => {
        return e.key.equals(indicatorStream._id);
    });
    return indicatorStream;
}

@odata.type(IndicatorStream)
@Edm.EntitySet("IndicatorStreams")
export class IndicatorStreamController extends ODataController {
    @odata.GET
    public async get(
        @odata.query query: ODataQuery
    ): Promise<IndicatorStream[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: IndicatorStream[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e: IndicatorStream) =>
                          setActive(new IndicatorStream(e))
                      )
                      .toArray();

        if (mongodbQuery.inlinecount) {
            result.inlinecount = await collection.count(false);
        }
        return result;
    }

    @odata.GET
    public async getOne(
        @odata.key key: string,
        @odata.query query: ODataQuery
    ): Promise<IndicatorStream> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = setActive(
            new IndicatorStream(
                await (await connect())
                    .collection(collectionName)
                    .findOne({ _id }, { projection })
            )
        );
        return result;
    }

    @odata.POST
    public async post(
        @odata.body
        {
            exchange,
            currency,
            asset,
            period,
        }: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
        }
    ): Promise<IndicatorStream> {
        const result = new IndicatorStream({
            exchange,
            currency,
            asset,
            period,
        });

        const collection = await (await connect()).collection(collectionName);
        result._id = (await collection.insertOne(result)).insertedId;
        return result;
    }

    @odata.PATCH
    public async patch(
        @odata.key key: string,
        @odata.body
        body: {
            exchange?: string;
            currency?: string;
            asset?: string;
            period?: number;
            active?: boolean;
        }
    ): Promise<number> {
        // если active то запустить стрим иначе остановить
        const _id = new ObjectID(key);
        const { active } = body;
        delete body.active;
        let modifiedCount = 0;
        if (Object.entries(body).length) {
            modifiedCount = (
                await (await connect())
                    .collection(collectionName)
                    .updateOne({ _id }, { $set: body })
            ).modifiedCount;
        }
        if (active !== undefined) {
            const options: IndicatorStream = setActive(
                await (await connect())
                    .collection(collectionName)
                    .findOne({ _id })
            );

            if (active !== options.active) {
                const instances = IndicatorStream._instances;
                if (active) {
                    const stream = ExchangeService.getCandleStream(options);
                    stream.on("data", async (candle: ICandle) => {
                        // запись в базу данных
                        const { exchange, currency, asset, period } = options;
                        const db = await connect();
                        const candleCollection = await db.collection("candle");
                        await candleCollection.findOneAndUpdate(
                            Object.assign(
                                {
                                    time: candle.time,
                                },
                                body
                            ),
                            {
                                $set: Object.assign(
                                    {
                                        exchange,
                                        currency,
                                        asset,
                                        period,
                                    },
                                    candle
                                ),
                            },
                            { upsert: true }
                        );

                        // выполнить вычисление всех индикаторов
                        await db
                            .collection("indicatorStreamInput")
                            .find({
                                indicatorStreamId: _id,
                            })
                            .forEach(async (e: IndicatorStreamInput) => {
                                const inputOptions = JSON.parse(e.options);
                                const start =
                                    1 +
                                    IndicatorService.getStart(
                                        e.name,
                                        inputOptions
                                    );

                                const candles = (
                                    await candleCollection
                                        .find({
                                            exchange,
                                            currency,
                                            asset,
                                            period,
                                        })
                                        .sort({ time: -1 })
                                        .limit(start)
                                        .toArray()
                                ).reverse();

                                if (candles.length >= start) {
                                    const output = await IndicatorService.getIndicators(
                                        candles,
                                        e.name,
                                        inputOptions
                                    );
                                    console.log(output); // FIXME время одинаковое
                                }
                            });

                        // console.log(candle); // UNDONE пока просто пример использования
                    });

                    instances.push({
                        key: _id,
                        stream,
                    });
                } else {
                    const index = instances.findIndex((e) => e.key.equals(_id));
                    if (index !== -1) {
                        const { stream } = instances.splice(index)[0];
                        await new Promise((resolve) => {
                            stream.on("close", () => resolve());
                            stream.destroy();
                        });
                    }
                }
                modifiedCount = 1;
            }
        }

        return modifiedCount;
    }

    @odata.GET("Inputs")
    public async getOrders(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<IndicatorStreamInput[]> {
        const indicatorStreamId = new ObjectID(result._id);
        const collection = (await connect()).collection("indicatorStreamInput");
        const mongodbQuery = createQuery(query);
        const items: IndicatorStreamInput[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  indicatorStreamId,
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
                            indicatorStreamId,
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
