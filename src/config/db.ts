import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("Error connecting to database", error);
    process.exit(1);
  }
}
