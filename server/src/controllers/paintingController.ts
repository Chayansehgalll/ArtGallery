import type { Request, Response, NextFunction } from "express";
import * as paintingService from "../services/paintingService.js";
import { sendSuccess, paginate } from "../utils/response.js";
import { createPaintingSchema } from "../validations/painting.js";
import { uploadStream }  from "../config/cloudinary.js";

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
    const painting = await paintingService.getPaintingBySlug(
      req.params.slug as string
    );
    sendSuccess(res, painting);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const painting = await paintingService.getPaintingById(
      req.params.id as string
    );
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
    const paintings = await paintingService.getRelatedPaintings(
      req.params.id as string
    );
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

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Safely type cast files with comprehensive fallback
    const files = req.files as { 
      coverImage?: Express.Multer.File[];
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    } | undefined;
    
    let coverImageUrl: string | undefined = undefined;
    let mainImageUrl: string | undefined = undefined;
    const additionalImageUrls: string[] = [];

    // 2. Strict buffer evaluation before uploading to Cloudinary
    if (files && files.coverImage && files.coverImage[0] && files.coverImage[0].buffer) {
      coverImageUrl = await uploadStream(
        files.coverImage[0].buffer,
        "paintings/covers"
      );
    }

    if (files && files.mainImage && files.mainImage[0] && files.mainImage[0].buffer) {
      mainImageUrl = await uploadStream(
        files.mainImage[0].buffer,
        "paintings/mains"
      );
    }

    // 3. Fully secure iteration for optional gallery images
    if (files && Array.isArray(files.images)) {
      for (const file of files.images) {
        if (file && file.buffer) {
          const url = await uploadStream(file.buffer, "paintings/gallery");
          additionalImageUrls.push(url);
        }
      }
    }

    const bodyData = { ...req.body };

    if (bodyData.frameOptions !== undefined) {
      bodyData.frameOptions = parseFormArray(bodyData.frameOptions);
    }
    if (bodyData.tags !== undefined) {
      bodyData.tags = parseFormArray(bodyData.tags);
    }

    for (const key in bodyData) {
      if (bodyData[key] === "" || bodyData[key] === "undefined" || bodyData[key] === "null") {
        bodyData[key] = undefined;
      }
    }

    let parsedData;
    try {
      parsedData = createPaintingSchema.parse(bodyData);
    } catch (zodErr: any) {
      if (zodErr.errors) {
        const msg = zodErr.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return res.status(400).json({ success: false, message: `Validation Error: ${msg}` });
      }
      return res.status(400).json({ success: false, message: "Validation parameters mismatch." });
    }

    // Combine uploaded cloud URLs or fallback properties safely
    let mainImage = mainImageUrl || parsedData.mainImage || (parsedData.images && parsedData.images[0]) || undefined;
    let coverImage = coverImageUrl || parsedData.coverImage || mainImage || undefined;
    
    if (mainImage && !coverImage) {
      coverImage = mainImage;
    }

    const images = additionalImageUrls.length > 0 
      ? additionalImageUrls 
      : (parsedData.images && parsedData.images.length ? parsedData.images : []);
    
    if (mainImage && !images.includes(mainImage)) {
      images.unshift(mainImage);
    }

    const painting = await paintingService.createPainting({
      ...parsedData,
      originalPrice: parsedData.originalPrice ?? undefined,
      story: parsedData.story ?? undefined,
      coverImage: coverImage ?? undefined,
      mainImage: mainImage ?? undefined,
      images: images.length > 0 ? images : [],
    });

    sendSuccess(res, painting, "Painting profile recorded successfully", 201);
  } catch (err) {
    next(err); // This will pass any remaining issues cleanly to errorHandler middleware instead of hard-crashing
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const files = req.files as { 
      coverImage?: Express.Multer.File[];
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    } | undefined;
    
    let coverImageUrl: string | undefined = undefined;
    let mainImageUrl: string | undefined = undefined;
    const additionalImageUrls: string[] = [];

    if (files?.coverImage?.[0]) {
      coverImageUrl = await uploadStream(files.coverImage[0].buffer, "paintings/covers");
    }
    if (files?.mainImage?.[0]) {
      mainImageUrl = await uploadStream(files.mainImage[0].buffer, "paintings/mains");
    }
    if (files?.images && files.images.length > 0) {
      for (const file of files.images) {
        const url = await uploadStream(file.buffer, "paintings/gallery");
        additionalImageUrls.push(url);
      }
    }

    const bodyData = { ...req.body };

    if (bodyData.frameOptions !== undefined) {
      bodyData.frameOptions = parseFormArray(bodyData.frameOptions);
    }
    if (bodyData.tags !== undefined) {
      bodyData.tags = parseFormArray(bodyData.tags);
    }
    if (bodyData.images !== undefined) {
      bodyData.images = parseFormArray(bodyData.images);
    }

    for (const key in bodyData) {
      if (bodyData[key] === "" || bodyData[key] === "undefined" || bodyData[key] === "null") {
        bodyData[key] = undefined;
      }
    }

    delete bodyData.id;
    delete bodyData.category;
    delete bodyData.slug;
    delete bodyData.createdAt;
    delete bodyData.updatedAt;

    const payload: Record<string, any> = {
      ...bodyData,
      ...(bodyData.price !== undefined && { price: Number(bodyData.price) }),
      ...(bodyData.originalPrice !== undefined && { originalPrice: bodyData.originalPrice ? Number(bodyData.originalPrice) : null }),
      ...(bodyData.width !== undefined && { width: Number(bodyData.width) }),
      ...(bodyData.height !== undefined && { height: Number(bodyData.height) }),
      ...(bodyData.year !== undefined && { year: Number(bodyData.year) }),
      ...(bodyData.edition !== undefined && { edition: Number(bodyData.edition) }),
      ...(bodyData.editionTotal !== undefined && { editionTotal: Number(bodyData.editionTotal) }),
      ...(bodyData.isOriginal !== undefined && { isOriginal: bodyData.isOriginal === "true" || bodyData.isOriginal === true }),
      ...(bodyData.isFeatured !== undefined && { isFeatured: bodyData.isFeatured === "true" || bodyData.isFeatured === true }),
      ...(bodyData.isActive !== undefined && { isActive: bodyData.isActive === "true" || bodyData.isActive === true }),
      ...(bodyData.inStock !== undefined && { inStock: bodyData.inStock === "true" || bodyData.inStock === true }),
    };

    if (coverImageUrl) payload.coverImage = coverImageUrl;
    if (mainImageUrl) payload.mainImage = mainImageUrl;
    
    const combinedImages = [...(payload.images || []), ...additionalImageUrls];
    if (combinedImages.length > 0) {
      payload.images = combinedImages;
    }

    const updatedPainting = await paintingService.updatePainting(id, payload);
    sendSuccess(res, updatedPainting, "Painting updated successfully");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await paintingService.deletePainting(
      req.params.id as string
    );
    sendSuccess(res, null, "Painting deleted");
  } catch (err) {
    next(err);
  }
}