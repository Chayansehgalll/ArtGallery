import multer from "multer";
import path from "path";
import { ValidationError } from "../utils/errors.js";

// Use memory storage instead of disk storage to prevent local file path destination crashes
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedAll = /\.(jpg|jpeg|png|gif|webp|avif|glb|gltf|obj|usdz)$/i;

  if (allowedAll.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new ValidationError("Invalid file type. Allowed: images, GLB, GLTF, OBJ, USDZ") as any, false);
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
}).array("images", 10);

// For admin uploads: coverImage and mainImage processed as memory buffers
export const uploadPaintingImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "mainImage", maxCount: 1 },
  { name: "images", maxCount: 10 }, // additional gallery images
]);

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for models
}).single("file");

export const uploadBanner = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

// Middleware to parse JSON strings from FormData fields and handle multipart fields safely
export const parseFormDataJson = (req: any, _res: any, next: any) => {
  // Multer stores text fields in req.body and memory arrays in req.files
  if (!req.body) {
    return next();
  }

  // Debug log
  if (req.body && Object.keys(req.body).length > 0) {
    console.debug("parseFormDataJson - req.body keys:", Object.keys(req.body));
  }

  // Parse JSON strings from FormData elements safely
  const fieldsToParse = ["tags", "frameOptions", "images"];
  fieldsToParse.forEach((field) => {
    if (req.body[field] !== undefined) {
      // Check if it's already an array
      if (Array.isArray(req.body[field])) {
        return; 
      }
      
      // If it's a string, try to parse it as JSON
      if (typeof req.body[field] === "string") {
        try {
          const parsed = JSON.parse(req.body[field]);
          if (Array.isArray(parsed)) {
            req.body[field] = parsed;
            console.debug(`Parsed ${field}:`, req.body[field]);
          }
        } catch (e) {
          console.debug(`Could not parse ${field} as JSON, leaving as string format:`, req.body[field]);
        }
      }
    }
  });

  next();
};