import { Router } from "express";
import multer from "multer";
import { mint } from "../controllers/nftController.js";

const router = Router();
const upload = multer(); // in-memory storage

// file field: 'image', other fields: name, description, attributes
router.post("/", upload.single("image"), mint);

export default router;
