import express, { json } from "express";
require("dotenv").config();
import apiRouter from "./routes/apiRouter";
import "./config";

const app = express();
app.use(json());

app.use("/api", apiRouter)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Timed-unlock backend server listening on port ${PORT}`);
})