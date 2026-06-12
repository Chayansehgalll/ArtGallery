import type { Request, Response, NextFunction } from "express";
import * as paintingService from "../services/paintingService.js";
import { sendSuccess, paginate } from "../utils/response.js";
import { createPaintingSchema } from "../validations/painting.js";

function parseFormArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch (e) {
        // Fallback
      }
    }
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  
  return [];
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginate(req.query as { page?: string; limit?: string });
    const result = await paintingService.getAllPaintings({
      page,
      limit,
      category: req.query.category as string,
      style: req.query.style as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      search: req.query.search as string,
      featured: req.query.featured === "true",
      sort: req.query.sort as string,
    });
    sendSuccess(res, result.data, "Paintings fetched", 200, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const painting = await paintingService.getPaintingBySlug(req.params.slug);
    sendSuccess(res, painting);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const painting = await paintingService.getPaintingById(req.params.id);
    sendSuccess(res, painting);
  } catch (err) {
    next(err);
  }
}

export async function getFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const paintings = await paintingService.getFeaturedPaintings(
      parseInt(req.query.limit as string) || 6
    );
    sendSuccess(res, paintings);
  } catch (err) {
    next(err);
  }
}

export async function getRelated(req: Request, res: Response, next: NextFunction) {
  try {
    const paintings = await paintingService.getRelatedPaintings(req.params.id);
    sendSuccess(res, paintings);
  } catch (err) {
    next(err);
  }
}

export async function getGallery(req: Request, res: Response, next: NextFunction) {
  try {
    const paintings = await paintingService.getGalleryPaintings();
    sendSuccess(res, paintings);
  } catch (err) {
    next(err);
  }
}

// Admin Creation Re-implemented
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as { 
      coverImage?: Express.Multer.File[];
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    } | undefined;
    
    const coverFile = files?.coverImage?.[0]?.path;
    const mainFile = files?.mainImage?.[0]?.path;
    const additionalFiles = files?.images?.map(f => f.path) || [];

    const bodyData = { ...req.body };

    if (bodyData.frameOptions !== undefined) {
      bodyData.frameOptions = parseFormArray(bodyData.frameOptions);
    }
    if (bodyData.tags !== undefined) {
      bodyData.tags = parseFormArray(bodyData.tags);
    }

    // Unset blanks cleanly to avoid coercion crashing
    for (const key in bodyData) {
      if (bodyData[key] === "") {
        bodyData[key] = undefined;
      }
    }

    const data = createPaintingSchema.parse(bodyData);

    let mainImage = mainFile || data.mainImage || data.images?.[0] || undefined;
    let coverImage = coverFile || data.coverImage || mainImage || undefined;
    
    if (mainImage && !coverImage) {
      coverImage = mainImage;
    }

    const images = additionalFiles.length > 0 ? additionalFiles : (data.images && data.images.length ? data.images : []);
    
    if (mainImage && !images.includes(mainImage)) {
      images.unshift(mainImage);
    }

    const painting = await paintingService.createPainting({
      ...data,
      originalPrice: data.originalPrice ?? undefined,
      story: data.story ?? undefined,
      coverImage: coverImage ?? undefined,
      mainImage: mainImage ?? undefined,
      images: images.length > 0 ? images : [],
    });
    sendSuccess(res, painting, "Painting created", 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  return res.status(405).json({ success: false, message: "Update painting is disabled" });
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await paintingService.deletePainting(req.params.id);
    sendSuccess(res, null, "Painting deleted");
  } catch (err) {
    next(err);
  }
}