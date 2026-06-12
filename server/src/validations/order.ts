import { z } from "zod";

export const orderItemSchema = z.object({
  paintingId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  frame: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  couponCode: z.string().optional(),
  shipping: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().default("IN"),
  }),
  paymentMethod: z.enum(["upi", "razorpay", "stripe"]).default("upi"),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});
