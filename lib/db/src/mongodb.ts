import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://adarshdeepsachan_db_user:a9vyyhKxJJHptfH1@cpcbusiness.a2mezra.mongodb.net/cpcbusiness?appName=CPCBusiness";

export async function connectMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: "cpcbusiness",
    });
    console.log(`[MongoDB] Connected successfully to Atlas cluster database: cpcbusiness`);
    return conn.connection;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}

export { mongoose };
