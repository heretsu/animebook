import mongoose from "mongoose";

const connectMongo = async () => {
  if (mongoose.connection.readyState > 0) {
    return mongoose.connection;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return db.connection;
  } catch (error) {
    console.log("Error connecting mon:", error);
  }
};

export default connectMongo;
