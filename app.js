import express from "express";
import { config } from "dotenv";
import schoolRouter from "./routes/school.js";
config();
const app = express();
app.use(express.json());
app.use("/api", schoolRouter);

export default app;
