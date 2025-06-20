import express from "express";
import nftRouter from "./routes/nft.js";

const app = express();
app.use(express.json());
app.use("/nft", nftRouter);

export default app;
