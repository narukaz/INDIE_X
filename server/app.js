import express from "express";
import metadataRouter from "./routes/metadata.js";

const app = express();
app.use(express.json());
app.use("/metadata", metadataRouter);
export default app;
