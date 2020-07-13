import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { IndicatorStreamInput } from "../model/IndicatorStreamInput";

const collectionName = "indicatorStreamInput";

@odata.type(IndicatorStreamInput)
@Edm.EntitySet("IndicatorStreamInputs")
export class IndicatorStreamInputController extends ODataController {
    @odata.GET
    public async get(
        @odata.query query: ODataQuery
    ): Promise<IndicatorStreamInput[]> {
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const collection = (await connect())
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection);

        const result: IndicatorStreamInput[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await collection
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map(
                          (e: IndicatorStreamInput) => e as IndicatorStreamInput
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
    ): Promise<IndicatorStreamInput> {
        const { projection } = createQuery(query);
        const _id = new ObjectID(key);
        const result = new IndicatorStreamInput(
            await (await connect())
                .collection(collectionName)
                .findOne({ _id }, { projection })
        );
        return result;
    }

    @odata.POST
    public async post(
        @odata.body
        body: {
            indicatorStreamId?: string;
            name?: string;
            options?: string;
        }
    ): Promise<IndicatorStreamInput> {
        const { indicatorStreamId } = body;
        delete body.indicatorStreamId;
        const result = new IndicatorStreamInput(body);
        if (indicatorStreamId) {
            result.indicatorStreamId = new ObjectID(indicatorStreamId);
        }

        const collection = await (await connect()).collection(collectionName);
        result._id = (await collection.insertOne(result)).insertedId;
        return result;
    }

    @odata.PATCH
    public async patch(
        @odata.key key: string,
        @odata.body
        body: {
            name?: string;
            options?: string;
        }
    ): Promise<number> {
        const _id = new ObjectID(key);
        let modifiedCount = 0;
        if (Object.entries(body).length) {
            modifiedCount = (
                await (await connect())
                    .collection(collectionName)
                    .updateOne({ _id }, { $set: body })
            ).modifiedCount;
        }

        return modifiedCount;
    }

    @odata.DELETE
    public async remove(@odata.key key: string): Promise<number> {
        const _id = new ObjectID(key);
        const collection = (await connect()).collection(collectionName);
        return collection
            .deleteOne({ _id })
            .then((result) => result.deletedCount);
    }
}
