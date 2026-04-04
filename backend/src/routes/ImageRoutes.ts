import { Router } from "express";
import multer from "multer";
import { ImageController } from "../controllers/ImageController";
import { requireAuth } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", requireAuth, upload.single("image"), ImageController.uploadImage);

export default router;
