import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://adarshdeepsachan_db_user:a9vyyhKxJJHptfH1@cpcbusiness.a2mezra.mongodb.net/cpcbusiness?appName=CPCBusiness";

export async function connectMongoDB() {
  mongoose.set("bufferCommands", false); // Disable command buffering to fail fast on blocked DB connections

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }


  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: "cpcbusiness",
      serverSelectionTimeoutMS: 2000, // Fail fast (2s) instead of hanging (30s) if blocked by firewall/IP whitelist
    });
    console.log(`[MongoDB] Connected successfully to Atlas cluster database: cpcbusiness`);
    return conn.connection;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}

export { mongoose };
