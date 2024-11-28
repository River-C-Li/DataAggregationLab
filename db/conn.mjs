import { MongoClient } from "mongodb";
import dotenv from "dotenv";    //old
dotenv.config();                //old

const client = new MongoClient(process.env.ATLAS_URI);
//const connectionString = process.env.ATLAS_URI || "";   //old
//const client = new MongoClient(connectionString);       ///old

let conn;
try {
  conn = await client.connect();
} catch (e) {
  console.error(e);
}

let db = conn.db("sample_training");

export default db;
