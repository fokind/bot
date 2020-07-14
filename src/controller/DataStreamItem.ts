import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { DataStreamIndicatorOutput } from "../model/DataStreamIndicatorOutput";
import { DataStreamItem } from "../model/DataStreamItem";

const collectionName = "dataStreamItem";

@odata.type(DataStreamItem)
@Edm.EntitySet("DataStreamItems")
export class DataStreamItemController extends ODataController {
    @odata.GET
    public async get(
        @odata.query query: ODataQuery
    ): Promise<DataStreamItem[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: DataStreamItem[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
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
    ): Promise<DataStreamItem> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = await (await connect())
            .collection(collectionName)
            .findOne({ _id }, { projection });
        return result;
    }

    @odata.GET("Indicators")
    public async getIndicators(
        @odata.result result: any,
        @odata.query query: ODataQuery
    ): Promise<DataStreamIndicatorOutput[]> {
        const dataStreamItemId = new ObjectID(result._id);
        const collection = (await connect()).collection(
            "dataStreamIndicatorOutput"
        );
        const mongodbQuery = createQuery(query);
        const items: DataStreamIndicatorOutput[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .find({
                          $and: [
                              {
                                  dataStreamItemId,
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
                            dataStreamItemId,
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
