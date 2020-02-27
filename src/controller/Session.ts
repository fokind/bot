import es from "event-stream";
import moment from "moment";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import { streamBuffer, streamTradesBacktest, streamTradesPaper } from "trader-service";
import connect from "../connect";
import { Candle } from "../models/Candle";
import { Session } from "../models/Session";
import { Ticker } from "../models/Ticker";

const collectionName = "session";

@odata.type(Session)
@Edm.EntitySet("Session")
export class SessionController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<Session[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: Session[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .map(
              e =>
                new Session(
                  Object.assign(e, {
                    // status: Session.streams[e._id] ? "active" : "inactive"
                  })
                )
            )
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
  public async getOne(
    @odata.key key: string,
    @odata.query query: ODataQuery
  ): Promise<Session> {
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const session = new Session(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
    // session.status = Session.streams[session._id.toHexString()]
    //   ? "active"
    //   : "inactive";
    return session;
  }

  @odata.POST
  public async post(
    @odata.body
    body: any
  ): Promise<Session> {
    const session = new Session(body);
    const db = await connect();
    const collection = await db.collection(collectionName);
    session._id = (await collection.insertOne(session)).insertedId;
    return session;
  }
  
  @odata.PATCH
  async patch(@odata.key key: string, @odata.body delta: any): Promise<number> {
    const db = await connect();
    if (delta._id) delete delta._id;
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    return await db.collection(collectionName).updateOne({ _id }, { $set: delta }).then(result => result.modifiedCount);
  }

  @odata.DELETE
  public async remove(@odata.key key: string): Promise<number> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    return (await connect())
      .collection(collectionName)
      .deleteOne({ _id })
      .then(result => result.deletedCount);
  }

  @odata.GET("Candles")
  public async getCandles(
    @odata.result result: Session,
    @odata.query query: ODataQuery
  ): Promise<Candle[]> {
    const db = await connect();
    const collection = db.collection("candle");
    const mongodbQuery = createQuery(query);
    const parentId = new ObjectID(result._id);
    const items: any =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await collection
            .find({ $and: [{ parentId }, mongodbQuery.query] })
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .toArray();
    if (mongodbQuery.inlinecount) {
      items.inlinecount = await collection
        .find({ $and: [{ parentId }, mongodbQuery.query] })
        .project(mongodbQuery.projection)
        .count(false);
    }
    return items;
  }
  
  @odata.GET("Ticker")
  public async getTicker(
    @odata.result result: Session,
    @odata.query query: ODataQuery
  ): Promise<Ticker> {
    const db = await connect();
    const collection = db.collection("ticker");
    const parentId = new ObjectID(result._id);
    const { projection } = createQuery(query);

    return new Ticker(
      await collection.findOne({ parentId }, { projection })
    );
  }
  
// нет ситуации в которой пользователь будет постить
//   @odata.POST
//   public async postTicker(@odata.result result: Session, @odata.body body: any): Promise<number> {
//     const ticker = new Ticker(body);
//     if (body._id) {
//         ticker._id = new ObjectID(body._id);
//     }
//     const parentId = new ObjectID(result._id);
//     ticker.parentId = parentId;
    
//     const db = await connect();
//     const collection = db.collection("ticker");

//     return await collection.updateOne({ parentId }, ticker, { upsert: true }).then(result => result.modifiedCount);
//   }
}