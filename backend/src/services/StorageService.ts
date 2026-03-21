import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export class StorageService {
  static async uploadFile(file: Express.Multer.File, folder: string = "uploads"): Promise<string> {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const fileName = `${folder}/${file.fieldname}-${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3Client.send(command);
      
      // Construct the public URL
      // If R2_PUBLIC_URL is something like https://pub-xxx.r2.dev
      const publicUrl = process.env.R2_PUBLIC_URL || "";
      return `${publicUrl.replace(/\/$/, "")}/${fileName}`;
    } catch (error) {
      console.error("R2 Upload Error:", error);
      throw new Error("Failed to upload file to Cloudflare R2");
    }
  }
}
