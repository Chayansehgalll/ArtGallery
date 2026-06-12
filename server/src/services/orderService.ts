import prisma from "../config/prisma.js";
import { generateOrderNumber } from "../utils/slug.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

export async function createOrder(customerId: string, data: {
  items: { paintingId: string; quantity: number; frame?: string }[];
  couponCode?: string;
  shipping: {
    name: string;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}) {
  // Validate paintings and calculate total
  const paintingIds = data.items.map((i) => i.paintingId);
  const paintings = await prisma.painting.findMany({
    where: { id: { in: paintingIds }, isActive: true, inStock: true },
  });

  if (paintings.length !== paintingIds.length) {
    throw new ValidationError("One or more paintings are unavailable");
  }

  let subtotal = 0;
  const orderItems = data.items.map((item) => {
    const painting = paintings.find((p) => p.id === item.paintingId)!;
    const price = Number(painting.price);
    subtotal += price * item.quantity;
    return {
      paintingId: item.paintingId,
      quantity: item.quantity,
      price,
      frame: item.frame || "Black Oak",
    };
  });

  // Coupon
  let discount = 0;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.couponCode.toUpperCase() },
    });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue))
    ) {
      if (coupon.discountType === "PERCENTAGE") {
        discount = subtotal * (Number(coupon.discountValue) / 100);
      } else {
        discount = Number(coupon.discountValue);
      }
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const tax = (subtotal - discount) * 0.18; // 18% GST
  const shipping = subtotal > 10000 ? 0 : 500; // Free over ₹10,000
  const total = subtotal - discount + tax + shipping;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId,
      status: "PENDING",
      subtotal,
      discount,
      tax,
      shipping,
      total,
      couponCode: data.couponCode?.toUpperCase(),
      shippingName: data.shipping.name,
      shippingEmail: data.shipping.email,
      shippingPhone: data.shipping.phone,
      shippingAddress: data.shipping.address,
      shippingCity: data.shipping.city,
      shippingState: data.shipping.state,
      shippingZip: data.shipping.zip,
      shippingCountry: data.shipping.country || "IN",
      paymentMethod: data.paymentMethod || "upi",
      paymentReference: data.paymentReference,
      paymentStatus: "VERIFICATION_PENDING",
      notes: data.notes,
      items: { create: orderItems },
    },
    include: {
      items: { include: { painting: true } },
      customer: { select: { id: true, email: true, name: true } },
    },
  });

  // Clear cart after placing order
  await prisma.cartItem.deleteMany({
    where: {
      customerId,
      paintingId: { in: paintingIds },
    },
  });

  return order;
}

export async function getCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      items: { include: { painting: { select: { id: true, title: true, images: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string, customerId?: string) {
  const where: Record<string, unknown> = { id: orderId };
  if (customerId) where.customerId = customerId;

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: { include: { painting: true } },
      customer: { select: { id: true, email: true, name: true, phone: true } },
    },
  });
  if (!order) throw new NotFoundError("Order");
  return order;
}

export async function getAllOrders(query: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { include: { painting: { select: { id: true, title: true, images: true } } } },
        customer: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { data: orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateOrderStatus(
  orderId: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order");

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { painting: true } } },
  });
}

/** Admin manually verifies a UPI payment reference and marks the order as paid */
export async function verifyOrderPayment(orderId: string, approved: boolean) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order");

  return prisma.order.update({
    where: { id: orderId },
    data: approved
      ? { paymentStatus: "PAID", status: "CONFIRMED" }
      : { paymentStatus: "REJECTED", status: "CANCELLED" },
    include: {
      items: { include: { painting: true } },
      customer: { select: { id: true, email: true, name: true } },
    },
  });
}

/** Admin — list orders awaiting payment verification */
export async function getPendingPayments() {
  return prisma.order.findMany({
    where: { paymentStatus: "VERIFICATION_PENDING" },
    include: {
      items: { include: { painting: { select: { id: true, title: true, images: true } } } },
      customer: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardStats() {
  const [totalOrders, totalRevenue, totalCustomers, totalPaintings, recentOrders, lowStock] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      }),
      prisma.customer.count(),
      prisma.painting.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true, email: true } },
          items: { include: { painting: { select: { title: true } } } },
        },
      }),
      prisma.painting.findMany({
        where: { inStock: true },
        select: { id: true, title: true, edition: true, editionTotal: true },
        take: 10,
      }),
    ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalCustomers,
    totalPaintings,
    recentOrders,
    lowStock: lowStock.filter((p) => p.editionTotal - p.edition < 5),
  };
}
