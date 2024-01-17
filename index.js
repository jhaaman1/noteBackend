import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { UserRoutes } from "./Routes/User.Routes.js";
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

const  allowedOrigins = process.env.FRONTEND_URL.split(",");
app.use(cors({ origin: allowedOrigins }));

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_URL, {
  dbName: process.env.MONGODB_NAME,
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});


UserRoutes(app);

app.listen(process.env.PORT, () => {
  console.log(
    `Server is running at http://localhost:${process.env.PORT || 8800}`
  );
});
