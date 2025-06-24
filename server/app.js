import express from "express";
import cors from "cors"; // ← import cors
import imageRouter from "./routes/image.js";
import metadataRouter from "./routes/metadata.js";

const app = express();

// Enable CORS for _all_ origins & methods:
app.use(cors()); // ← add this

app.use(express.json());
app.use("/image", imageRouter);
app.use("/metadata", metadataRouter);

app.get("/get", async (req, res) => {
  res.status(200).json({ status: "awake" });
});

export default app;
