import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { uploadProfile } from "../middleware/upload";
import { AuthRequest } from "../middleware/auth";
import { StorageService } from "../services/StorageService";

export const uploadRouter = Router();

// General upload (for registration or other uses)
// This returns the public URL of the uploaded file
uploadRouter.post("/profile", requireAuth, uploadProfile.single("photo"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const publicUrl = await StorageService.uploadFile(req.file, "profiles");

    res.json({
      message: "File uploaded successfully",
      url: publicUrl
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
