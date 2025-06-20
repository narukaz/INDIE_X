import express from "express";
import imageRouter from "./routes/image.js";
import metadataRouter from "./routes/metadata.js";

const app = express();
app.use(express.json());
app.use("/image", imageRouter);
app.use("/metadata", metadataRouter);
export default app;
