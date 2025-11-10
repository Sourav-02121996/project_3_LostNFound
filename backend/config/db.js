import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let isConnected = false;

export async function getDb() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  const dbName = process.env.DB_NAME || "LostNFound";
  return client.db(dbName);
}
