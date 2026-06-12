import type { Request, Response, NextFunction } from "express";
import * as paintingService from "../services/paintingService.js";
import { sendSuccess, paginate } from "../utils/response.js";
import { createPaintingSchema, updatePaintingSchema } from "../validations/painting.js";

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

// Admin
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    // Multipart uploads land in req.files; map cover/main by field name.
    // req.files structure: { coverImage?: File[], mainImage?: File[], images?: File[] }
    const files = req.files as { 
      coverImage?: Express.Multer.File[];
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    } | undefined;
    
    const coverFile = files?.coverImage?.[0]?.path;
    const mainFile = files?.mainImage?.[0]?.path;
    const additionalFiles = files?.images?.map(f => f.path) || [];

    const data = createPaintingSchema.parse(req.body);

    // Image resolution priority:
    // 1. Uploaded files (coverFile, mainFile)
    // 2. URLs from body
    // 3. Additional images array
    // Fallback: if only one image provided, use it for both cover and main
    
    let mainImage = mainFile || data.mainImage || data.images?.[0] || undefined;
    let coverImage = coverFile || data.coverImage || mainImage || undefined;
    
    // If only mainImage exists and no cover, use main as cover
    if (mainImage && !coverImage) {
      coverImage = mainImage;
    }

    // Build images array: start with uploaded additional images, then fallback to data.images
    const images = additionalFiles.length > 0 ? additionalFiles : (data.images && data.images.length ? data.images : []);
    
    // Ensure main image is in the images array
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
  try {
    console.log("=== UPDATE PAINTING ===");
    console.log("req.body:", req.body);
    console.log("req.body keys:", Object.keys(req.body || {}));
    console.log("req.files keys:", Object.keys((req.files as any) || {}));

    const files = req.files as { 
      coverImage?: Express.Multer.File[];
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    } | undefined;
    
    const coverFile = files?.coverImage?.[0]?.path;
    const mainFile = files?.mainImage?.[0]?.path;
    const additionalFiles = files?.images?.map(f => f.path) || [];

    // Partial parse — only provided fields are validated; unknown keys stripped.
    const data = updatePaintingSchema.parse(req.body);
    console.log("Parsed data:", data);

    // Build the update payload — only include keys that were actually provided
    // so existing values (including images) are preserved otherwise.
    const payload: Record<string, unknown> = { ...data };
    delete payload.coverImage;
    delete payload.mainImage;
    delete payload.images;

    // Image handling: uploaded file takes priority over body URL
    // Only update image fields if explicitly provided (uploaded or in body)
    const newCover = coverFile || (typeof data.coverImage === "string" && data.coverImage ? data.coverImage : undefined);
    const newMain = mainFile || (typeof data.mainImage === "string" && data.mainImage ? data.mainImage : undefined);
    
    if (coverFile) {
      payload.coverImage = coverFile; // uploaded file
    } else if (data.coverImage !== undefined) {
      payload.coverImage = data.coverImage; // explicit URL or null to clear
    }
    // If neither uploaded nor in body, don't touch coverImage (preserve existing)
    
    if (mainFile) {
      payload.mainImage = mainFile; // uploaded file
    } else if (data.mainImage !== undefined) {
      payload.mainImage = data.mainImage; // explicit URL or null to clear
    }
    // If neither uploaded nor in body, don't touch mainImage (preserve existing)
    
    // Handle images array: use uploaded if provided, otherwise use body
    if (additionalFiles.length > 0) {
      payload.images = additionalFiles;
    } else if (data.images !== undefined) {
      payload.images = data.images;
    }
    // If neither, preserve existing images

    const painting = await paintingService.updatePainting(req.params.id, payload);
    sendSuccess(res, painting, "Painting updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await paintingService.deletePainting(req.params.id);
    sendSuccess(res, null, "Painting deleted");
  } catch (err) {
    next(err);
  }
}
