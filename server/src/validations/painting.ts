import { z } from "zod";

/* Use coercion so values arriving as strings (number inputs, form-data)
   are accepted, and `.partial()` on update allows any subset of fields. */
export const createPaintingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  story: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  width: z.coerce.number().int().positive().default(24),
  height: z.coerce.number().int().positive().default(36),
  medium: z.string().default("Oil on Canvas"),
  style: z.string().default("Contemporary"),
  year: z.coerce.number().int().default(2024),
  edition: z.coerce.number().int().positive().default(1),
  editionTotal: z.coerce.number().int().positive().default(1),
  isOriginal: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  inStock: z.coerce.boolean().default(true),
  frameOptions: z.array(z.string()).default(["Black Oak", "Walnut"]),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional().nullable(),
  mainImage: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().min(1, "Category is required"),
});

/* Partial update — every field optional, unknown keys are stripped by zod. */
export const updatePaintingSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    story: z.string().optional().nullable(),
    price: z.coerce.number().positive().optional(),
    originalPrice: z.coerce.number().positive().optional().nullable(),
    width: z.coerce.number().int().positive().optional(),
    height: z.coerce.number().int().positive().optional(),
    medium: z.string().optional(),
    style: z.string().optional(),
    year: z.coerce.number().int().optional(),
    edition: z.coerce.number().int().positive().optional(),
    editionTotal: z.coerce.number().int().positive().optional(),
    isOriginal: z.coerce.boolean().optional(),
    isFeatured: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
    inStock: z.coerce.boolean().optional(),
    frameOptions: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional().nullable(),
    mainImage: z.string().optional().nullable(),
    images: z.array(z.string()).optional(),
    categoryId: z.string().min(1).optional(),
  })
  // Drop unknown keys (category object, slug, id, timestamps, etc.)
  .strip();

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image: z.string().optional(),
  order: z.coerce.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
