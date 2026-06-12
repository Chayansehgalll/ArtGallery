import type { Request, Response, NextFunction } from "express";
import { uploadStream } from "../config/cloudinary.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

/**
 * Handles generic multi-image uploads from the admin dashboard via RAM memory buffers
 */
export async function uploadImages(req: Request, res: Response, next: NextFunction) {
  try {
    // Multer array updates place file data elements within req.files
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new ValidationError("No image files provided for upload");
    }

    const uploadedUrls: string[] = [];

    // Stream each file buffer sequentially up onto Cloudinary securely
    for (const file of files) {
      const url = await uploadStream(file.buffer, "gallery/uploads");
      uploadedUrls.push(url);
    }

    sendSuccess(
      res, 
      { urls: uploadedUrls, storage: "cloudinary" }, 
      "Images uploaded successfully to Cloudinary cloud network storage"
    );
  } catch (err) {
    next(err);
  }
}