import { Router } from "express";
import { publishMetadata } from "../controllers/metadataController.js";

const router = Router();
router.post("/", publishMetadata);
export default router;
