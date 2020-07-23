import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { DataStream } from "../model/DataStream";
import { DataStreamIndicatorInput } from "../model/DataStreamIndicatorInput";
import { DataStreamItem } from "../model/DataStreamItem";
import { Strategy } from "../model/Strategy";
import { AdviceService, IAdviceInputItem } from "../service/AdviceService";
import { IndicatorStreamService } from "../service/IndicatorStreamService";

const collectionName = "dataStream";

function setActive(dataStream: DataStream): DataStream {
    const key = dataStream._id.toHexString();
    dataStream.active = !!IndicatorStreamService._instances.find((e) => {
        return e.key === key;
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
            strategyId: string | ObjectID;
        }
    ): Promise<DataStream> {
        const { strategyId } = body;
        if (strategyId) {
            body.strategyId = new ObjectID(strategyId);
        }
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
            strategyId?: string | ObjectID;
            active?: boolean;
        }
    ): Promise<number> {
        // если active то запустить стрим иначе остановить
        const _id = new ObjectID(key);
        const { active } = body;
        delete body.active;
        let strategyId = body.strategyId;
        if (strategyId) {
            body.strategyId = new ObjectID(strategyId);
        }
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
                if (active) {
                    const indicatorInputs: Array<{
                        key: string;
                        name: string;
                        options: number[];
                    }> = await (await connect())
                        .collection("dataStreamIndicatorInput")
                        .find({
                            dataStreamId: _id,
                        })
                        .map(
                            (e: {
                                key: string;
                                name: string;
                                options: string;
                            }) => ({
                                key: e.key,
                                name: e.name,
                                options: JSON.parse(e.options) as number[],
                            })
                        )
                        .toArray();
                    const indicatorStreamService = IndicatorStreamService.createInstance(
                        Object.assign(
                            {
                                key: _id.toHexString(),
                                indicatorInputs,
                            },
                            options
                        )
                    );

                    if (!strategyId) {
                        strategyId = options.strategyId;
                    }

                    const { warmup, code: strategyCode } = (await (
                        await connect()
                    )
                        .collection("strategy")
                        .findOne({ _id: strategyId })) as Strategy;

                    const data: IAdviceInputItem[] = [];

                    indicatorStreamService.onData((dataItem) => {
                        // сохранять в базу данных или выполнять постобработку
                        // как минимум необходимо применить стратегию
                        const existedDataItem = data.find(
                            (e) => e.time === dataItem.time
                        );
                        if (existedDataItem) {
                            Object.assign(existedDataItem, dataItem);
                        } else {
                            data.push(dataItem);
                        }
                        if (data.length > warmup) {
                            data.shift();
                        }
                        if (data.length >= warmup) {
                            const advice = AdviceService.getAdvice(
                                data,
                                strategyCode
                            );
                            const output = Object.assign({ advice }, dataItem);
                            console.log(output); // TODO здесь должно что-то происходить
                        }
                    });

                    await indicatorStreamService.start();
                } else {
                    await IndicatorStreamService.stop(_id.toHexString());
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
