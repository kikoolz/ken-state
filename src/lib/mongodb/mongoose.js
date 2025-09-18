import mongoose from "mongoose";

let initialized = false;

export const connect = async () => {
  mongoose.set("strictQuery", true);

  if (initialized) {
    console.log("MongoDB already connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "ken-state",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    initialized = true;
    console.log("MongoDB, connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};
