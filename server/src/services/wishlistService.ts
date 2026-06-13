import prisma from "../config/prisma.js";

export async function getWishlist(customerId: string) {
  return prisma.wishlistItem.findMany({
    where: { customerId },
    include: { painting: true },
    orderBy: { id: "asc" },
  });
}

export async function toggleWishlist(
  customerId: string,
  paintingId: string
) {
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      customerId_paintingId: {
        customerId,
        paintingId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    return {
      inWishlist: false,
    };
  }

  await prisma.wishlistItem.create({
    data: {
      customerId,
      paintingId,
    },
  });

  return {
    inWishlist: true,
  };
}

export async function removeFromWishlist(
  customerId: string,
  paintingId: string
) {
  await prisma.wishlistItem.deleteMany({
    where: {
      customerId,
      paintingId,
    },
  });
}

export async function isInWishlist(
  customerId: string,
  paintingId: string
) {
  const item = await prisma.wishlistItem.findUnique({
    where: {
      customerId_paintingId: {
        customerId,
        paintingId,
      },
    },
  });

  return !!item;
}