import prisma from "../config/prisma.js";
import { toSlug } from "../utils/slug.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { paintings: true } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { paintings: true } } },
  });
  if (!category) throw new NotFoundError("Category");
  return category;
}

export async function createCategory(data: { name: string; image?: string; order?: number }) {
  const slug = toSlug(data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new ConflictError("Category already exists");

  return prisma.category.create({
    data: { ...data, slug },
  });
}

export async function updateCategory(id: string, data: { name?: string; image?: string; order?: number }) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Category");

  let slugUpdate = {};
  if (data.name) {
    slugUpdate = { slug: toSlug(data.name) };
  }

  return prisma.category.update({
    where: { id },
    data: { ...data, ...slugUpdate },
  });
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Category");
  return prisma.category.delete({ where: { id } });
}
