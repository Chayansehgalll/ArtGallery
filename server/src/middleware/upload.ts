import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ValidationError } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImages = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
  const allowedModels = /\.(glb|gltf|obj|usdz)$/i;
  const allowedAll = /\.(jpg|jpeg|png|gif|webp|avif|glb|gltf|obj|usdz)$/i;

  if (allowedAll.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new ValidationError("Invalid file type. Allowed: images, GLB, GLTF, OBJ, USDZ"));
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
}).array("images", 10);

// For admin uploads: coverImage and mainImage as separate fields
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

// Middleware to parse JSON strings from FormData fields and handle multipart fields
// When multer.fields() is used, non-file form fields need to be manually extracted and parsed
export const parseFormDataJson = (req: any, _res: any, next: any) => {
  // Multer puts form fields in req.body and files in req.files
  if (!req.body) {
    return next();
  }

  // Debug log
  if (req.body && Object.keys(req.body).length > 0) {
    console.debug("parseFormDataJson - req.body keys:", Object.keys(req.body));
  }

  // Parse JSON strings from FormData
  const fieldsToparse = ["tags", "frameOptions", "images"];
  fieldsToparse.forEach((field) => {
    if (req.body[field] !== undefined) {
      // Check if it's already an array (shouldn't be, but just in case)
      if (Array.isArray(req.body[field])) {
        return; // Already parsed
      }
      
      // If it's a string, try to parse as JSON
      if (typeof req.body[field] === "string") {
        try {
          const parsed = JSON.parse(req.body[field]);
          if (Array.isArray(parsed)) {
            req.body[field] = parsed;
            console.debug(`Parsed ${field}:`, req.body[field]);
          }
        } catch (e) {
          console.debug(`Could not parse ${field} as JSON:`, req.body[field]);
          // Keep as-is if not valid JSON
        }
      }
    }
  });

  next();
};
