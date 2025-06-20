import { Router } from "express";
import { pin, fetchByCid } from "../controllers/metadata.js";
const router = Router();
router.post("/", pin);
router.get("/:cid", fetchByCid);
export default router;
