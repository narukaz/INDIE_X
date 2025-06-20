import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  console.log("somebody is fetching the request");
  res.json({ message: "🚀 Successful connection" });
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
