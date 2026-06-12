import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cloudinary with environmental configuration variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file memory buffer directly to Cloudinary via a stream wrapper interface
 * @param fileBuffer - The memory buffer from req.file / req.files
 * @param folder - Destination path folder name inside your Cloudinary storage dashboard
 */
export function uploadStream(fileBuffer: Buffer, folder: string = "art_gallery"): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload stream returned an empty response."));
        }
        // Return the secure cloud HTTPS asset link
        resolve(result.secure_url);
      }
    );
    
    // Close the stream pipeline writing out the raw memory buffer bits
    stream.end(fileBuffer);
  });
}

export default cloudinary;