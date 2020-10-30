import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Roundtrip } from "../model/Roundtrip";

const collectionName = "roundtrip";

@odata.type(Roundtrip)
@Edm.EntitySet("Roundtrips")
export class RoundtripController extends ODataController {
    @odata.GET
    public async get(
        @odata.query query: ODataQuery
    ): Promise<Roundtrip[] & { inlinecount?: number }> {
        const db = await connect();
        const mongodbQuery = createQuery(query);

        if (mongodbQuery.query._id) {
            mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
        }

        const result: Roundtrip[] & { inlinecount?: number } =
            typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : await db
                      .collection(collectionName)
                      .find(mongodbQuery.query)
                      .project(mongodbQuery.projection)
                      .skip(mongodbQuery.skip || 0)
                      .limit(mongodbQuery.limit || 0)
                      .sort(mongodbQuery.sort)
                      .map((e) => new Roundtrip(e))
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
    ): Promise<Roundtrip> {
        const { projection } = createQuery(query);
        // tslint:disable-next-line: variable-name
        const _id = new ObjectID(key);
        const db = await connect();
        return new Roundtrip(
            await db.collection(collectionName).findOne({ _id }, { projection })
        );
    }
}
