import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import { env } from "../config/env.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError } from "../utils/errors.js";

const cloudinaryConfigured =
  !!env.cloudinaryCloudName && !!env.cloudinaryApiKey && !!env.cloudinaryApiSecret;

/**
 * Upload one or more images.
 * - If Cloudinary credentials exist → uploads there, returns CDN URLs,
 *   deletes the temp local file.
 * - Otherwise → keeps the file in /uploads and returns a local URL
 *   (served statically). Works out-of-the-box with zero config.
 */
export async function uploadImages(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw new ValidationError("No files received");
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const urls: string[] = [];

    for (const file of files) {
      if (cloudinaryConfigured) {
        const { url } = await uploadToCloudinary(file.path);
        urls.push(url);
        // Remove temp file after uploading to the CDN
        fs.unlink(file.path, () => {});
      } else {
        // Local fallback — served from /uploads
        urls.push(`${baseUrl}/uploads/${file.filename}`);
      }
    }

    sendSuccess(
      res,
      { urls, storage: cloudinaryConfigured ? "cloudinary" : "local" },
      "Images uploaded"
    );
  } catch (err) {
    next(err);
  }
}
