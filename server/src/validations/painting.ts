import { z } from "zod";

// Safe preprocessor to convert string flags ("true" / "false") from FormData to real booleans
const preprocessBoolean = z.preprocess((val) => {
  if (typeof val === "string") {
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;
  }
  return val;
}, z.boolean());

export const createPaintingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  story: z.string().optional().nullable(),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  width: z.coerce.number().int().positive().default(24),
  height: z.coerce.number().int().positive().default(36),
  medium: z.string().default("Oil on Canvas"),
  style: z.string().default("Contemporary"),
  year: z.coerce.number().int().default(2024),
  edition: z.coerce.number().int().positive().default(1),
  editionTotal: z.coerce.number().int().positive().default(1),
  isOriginal: preprocessBoolean.default(true),
  isFeatured: preprocessBoolean.default(false),
  isActive: preprocessBoolean.default(true),
  inStock: preprocessBoolean.default(true),
  frameOptions: z.array(z.string()).default(["Black Oak", "Walnut"]),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional().nullable(),
  mainImage: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  categoryId: z.string().min(1, "Category is required"),
});

export const updatePaintingSchema = createPaintingSchema.partial().strip();

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();