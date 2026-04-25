import mongoose from "mongoose";

export async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Mongodb connection is successfully established.");
  } catch (error) {
    console.log("Mongodb connection failed");
    console.log("EXITING NOW");
    process.exit(1);
  }
}
