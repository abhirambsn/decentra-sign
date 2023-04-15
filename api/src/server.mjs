import mongoose from "mongoose";
import app from "./app.mjs";
import http from "http";

const server = http.createServer(app);

const main = async () => {
  mongoose.set("strictQuery", false);
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
    server.listen(app.get("port"), () => {
      console.log(`Server running on port ${app.get("port")}`);
    });
  });
};

await main();
