import mongoose from "mongoose";

export default async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || "");
      console.log("Connected to database");
    }
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}

// TODO: Is this mechanism for connecting to the database fine or should we implement a system where it first checks for existing connection and if it doesn't exist, then it connects to the database?