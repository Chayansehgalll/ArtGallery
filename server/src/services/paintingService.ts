import prisma from "../config/prisma.js";
import { toSlug } from "../utils/slug.js";
import { NotFoundError } from "../utils/errors.js";
import type { Prisma } from "@prisma/client";

const paintingSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  story: true,
  price: true,
  originalPrice: true,
  width: true,
  height: true,
  medium: true,
  style: true,
  year: true,
  edition: true,
  editionTotal: true,
  isOriginal: true,
  isFeatured: true,
  isActive: true,
  inStock: true,
  frameOptions: true,
  tags: true,
  coverImage: true,
  mainImage: true,
  images: true,
  thumbnail: true,
  model3d: true,
  arAsset: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true } },
  createdAt: true,
  updatedAt: true,
};

export async function getAllPaintings(query: {
  page?: number;
  limit?: number;
  category?: string;
  style?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  sort?: string;
}) {
  const { page = 1, limit = 12 } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.PaintingWhereInput = {
    isActive: true,
  };

  if (query.category) {
    where.category = { slug: query.category };
  }
  if (query.style) {
    where.style = query.style;
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined && { gte: query.minPrice }),
      ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
    };
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { tags: { hasSome: [query.search] } },
    ];
  }
  if (query.featured) {
    where.isFeatured = true;
  }

  const orderBy: Prisma.PaintingOrderByWithRelationInput =
    query.sort === "price-asc"
      ? { price: "asc" }
      : query.sort === "price-desc"
        ? { price: "desc" }
        : query.sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" };

  const [paintings, total] = await Promise.all([
    prisma.painting.findMany({
      where,
      select: paintingSelect,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.painting.count({ where }),
  ]);

  return {
    data: paintings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPaintingBySlug(slug: string) {
  const painting = await prisma.painting.findUnique({
    where: { slug },
    select: paintingSelect,
  });
  if (!painting) throw new NotFoundError("Painting");
  return painting;
}

export async function getPaintingById(id: string) {
  const painting = await prisma.painting.findUnique({
    where: { id },
    select: paintingSelect,
  });
  if (!painting) throw new NotFoundError("Painting");
  return painting;
}

export async function getFeaturedPaintings(limit: number = 6) {
  return prisma.painting.findMany({
    where: { isFeatured: true, isActive: true },
    select: paintingSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getRelatedPaintings(paintingId: string, limit: number = 4) {
  const painting = await prisma.painting.findUnique({
    where: { id: paintingId },
    select: { categoryId: true, style: true, id: true },
  });
  if (!painting) return [];

  return prisma.painting.findMany({
    where: {
      id: { not: paintingId },
      isActive: true,
      OR: [{ categoryId: painting.categoryId }, { style: painting.style }],
    },
    select: paintingSelect,
    take: limit,
  });
}

export async function createPainting(data: {
  title: string;
  description: string;
  story?: string;
  price: number;
  originalPrice?: number;
  width?: number;
  height?: number;
  medium?: string;
  style?: string;
  year?: number;
  edition?: number;
  editionTotal?: number;
  isOriginal?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  inStock?: boolean;
  frameOptions?: string[];
  tags?: string[];
  coverImage?: string;
  mainImage?: string;
  images?: string[];
  thumbnail?: string;
  model3d?: string;
  arAsset?: string;
  categoryId: string;
}) {
  const slug = toSlug(data.title);
  let uniqueSlug = slug;
  let counter = 1;

  while (await prisma.painting.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter++}`;
  }

  // Auto-fallback: if only one image provided, reuse it for the other slot.
  const mainImage = data.mainImage || data.images?.[0] || data.coverImage;
  const coverImage = data.coverImage || data.mainImage || data.images?.[0];

  return prisma.painting.create({
    data: {
      ...data,
      slug: uniqueSlug,
      coverImage,
      mainImage,
      thumbnail: coverImage,
      images: data.images && data.images.length ? data.images : mainImage ? [mainImage] : [],
    },
    select: paintingSelect,
  });
}

export async function updatePainting(id: string, data: Record<string, unknown>) {
  const existing = await prisma.painting.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Painting");

  let slugUpdate = {};
  const title = data.title as string | undefined;
  if (title && title !== existing.title) {
    let newSlug = toSlug(title);
    let counter = 1;
    while (await prisma.painting.findFirst({ where: { slug: newSlug, id: { not: id } } })) {
      newSlug = `${toSlug(title)}-${counter++}`;
    }
    slugUpdate = { slug: newSlug };
  }

  const cover = data.coverImage as string | undefined;
  const main = data.mainImage as string | undefined;

  // Keep legacy `thumbnail` mirrored to the cover image.
  const sync: Record<string, unknown> = {};
  if (cover !== undefined) sync.thumbnail = cover;

  // Fallback: only a main image was set and no cover exists anywhere → cover = main
  if (main !== undefined && cover === undefined && !existing.coverImage) {
    sync.coverImage = main;
    sync.thumbnail = main;
  }

  return prisma.painting.update({
    where: { id },
    data: { ...data, ...slugUpdate, ...sync },
    select: paintingSelect,
  });
}

export async function deletePainting(id: string) {
  const existing = await prisma.painting.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Painting");
  return prisma.painting.delete({ where: { id } });
}

export async function getGalleryPaintings() {
  return prisma.painting.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      mainImage: true,
      images: true,
      thumbnail: true,
      price: true,
      width: true,
      height: true,
      medium: true,
      style: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
