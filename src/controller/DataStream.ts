import { ExchangeService, ICandle } from "exchange-service";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { DataStream } from "../model/DataStream";
import { DataStreamIndicatorInput } from "../model/DataStreamIndicatorInput";
import { DataStreamItem } from "../model/DataStreamItem";
import { IndicatorService } from "../service/IndicatorService";

const collectionName = "dataStream";

function setActive(dataStream: DataStream): DataStream {
    dataStream.active = !!DataStream._instances.find((e) => {
        return e.key.equals(dataStream._id);
    });
    return dataStream;
}

@odata.type(DataStream)
@Edm.EntitySet("DataStreams")
export class DataStreamController extends ODataController {
    @odata.GET
    public async get(@odata.query query: ODataQuery): Promise<DataStream[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: DataStream[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e: DataStream) => setActive(new DataStream(e)))
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
    ): Promise<DataStream> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = setActive(
            new DataStream(
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
        body: {
            exchange: string;
            currency: string;
            asset: string;
            period: number;
        }
    ): Promise<DataStream> {
        const result = new DataStream(body);
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
            const options: DataStream = setActive(
                await (await connect())
                    .collection(collectionName)
                    .findOne({ _id })
            );

            if (active !== options.active) {
                const instances = DataStream._instances;
                if (active) {
                    const stream = ExchangeService.getCandleStream(options);
                    stream.on("data", async (candle: ICandle) => {
                        // запись в базу данных
                        const { exchange, currency, asset, period } = options;
                        const db = await connect();
                        const dataStreamItemCollection = await db.collection(
                            "dataStreamItem"
                        );
                        await dataStreamItemCollection.findOneAndUpdate(
                            {
                                dataStreamId: _id,
                                time: candle.time,
                            },
                            {
                                $set: Object.assign(
                                    {
                                        dataStreamId: _id,
                                    },
                                    candle
                                ),
                            },
                            { upsert: true }
                        );

                        // // выполнить вычисление всех индикаторов
                        // await db
                        //     .collection("indicatorStreamInput")
                        //     .find({
                        //         indicatorStreamId: _id,
                        //     })
                        //     .forEach(async (e: IndicatorStreamInput) => {
                        //         const inputOptions = JSON.parse(e.options);
                        //         const start =
                        //             1 +
                        //             IndicatorService.getStart(
                        //                 e.name,
                        //                 inputOptions
                        //             );

                        //         const candles = (
                        //             await candleCollection
                        //                 .find({
                        //                     exchange,
                        //                     currency,
                        //                     asset,
                        //                     period,
                        //                 })
                        //                 .sort({ time: -1 })
                        //                 .limit(start)
                        //                 .toArray()
                        //         ).reverse();

                        //         if (candles.length >= start) {
                        //             const output = await IndicatorService.getIndicators(
                        //                 candles,
                        //                 e.name,
                        //                 inputOptions
                        //             );
                        //             console.log(output); // FIXME время одинаковое
                        //         }
                        //     });

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

    @odata.GET("IndicatorInputs")
    public async getIndicatorInputs(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<DataStreamIndicatorInput[]> {
        const dataStreamId = new ObjectID(result._id);
        const collection = (await connect()).collection(
            "dataStreamIndicatorInput"
        );
        const mongodbQuery = createQuery(query);
        const items: DataStreamIndicatorInput[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  dataStreamId,
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
                            dataStreamId,
                        },
                        mongodbQuery.query,
                    ],
                })
                .project(mongodbQuery.projection)
                .count(false);
        }
        return items;
    }

    @odata.GET("Items")
    public async getItems(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<DataStreamItem[]> {
        const dataStreamId = new ObjectID(result._id);
        const collection = (await connect()).collection("dataStreamItem");
        const mongodbQuery = createQuery(query);
        const items: DataStreamItem[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  dataStreamId,
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
                            dataStreamId,
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
