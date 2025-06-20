import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
app.use(express.json());
const port = 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
