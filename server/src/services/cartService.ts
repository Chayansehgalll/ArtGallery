import prisma from "../config/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export async function getCart(customerId: string) {
  return prisma.cartItem.findMany({
    where: { customerId },
    include: { painting: true },
    orderBy: { id: "asc" },
  });
}

export async function addToCart(
  customerId: string,
  paintingId: string,
  quantity: number = 1,
  frame?: string
) {
  const painting = await prisma.painting.findUnique({
    where: { id: paintingId },
  });

  if (!painting) throw new NotFoundError("Painting");

  const existing = await prisma.cartItem.findUnique({
    where: {
      customerId_paintingId_frame: {
        customerId,
        paintingId,
        frame: frame || "Black Oak",
      },
    },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
      },
      include: { painting: true },
    });
  }

  return prisma.cartItem.create({
    data: {
      customerId,
      paintingId,
      quantity,
      frame: frame || "Black Oak",
    },
    include: {
      painting: true,
    },
  });
}

export async function updateCartItem(
  customerId: string,
  itemId: string,
  quantity: number
) {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      customerId,
    },
  });

  if (!item) throw new NotFoundError("Cart item");

  if (quantity <= 0) {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { painting: true },
  });
}

export async function removeFromCart(
  customerId: string,
  itemId: string
) {
  const item = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      customerId,
    },
  });

  if (!item) throw new NotFoundError("Cart item");

  return prisma.cartItem.delete({
    where: { id: itemId },
  });
}

export async function clearCart(customerId: string) {
  return prisma.cartItem.deleteMany({
    where: { customerId },
  });
}