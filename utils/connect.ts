import "dotenv";
import { MongoClient } from "mongodb";

let connect;

export default async function () {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DBNAME;

    if (!connect) {
        connect = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    if (!connect.isConnected()) {
        await connect.connect();
    }

    return connect.db(dbName);
}
