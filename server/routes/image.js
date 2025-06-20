import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/imageController.js";

const router = Router();
const upload = multer();
router.post("/", upload.single("image"), uploadImage);
export default router;
