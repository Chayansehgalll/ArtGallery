import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { generateTokenPair, generateAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { NotFoundError, UnauthorizedError, ConflictError } from "../utils/errors.js";
import type { AuthUser } from "../middleware/auth.js";

export async function createCustomer(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const customer = await prisma.customer.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  const tokens = generateTokenPair({
    id: customer.id,
    email: customer.email,
    role: "customer",
  });

  return {
    customer: sanitizeCustomer(customer),
    ...tokens,
  };
}

export async function loginCustomer(email: string, password: string) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.password) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, customer.password);
  if (!valid) throw new UnauthorizedError("Invalid email or password");

  const tokens = generateTokenPair({
    id: customer.id,
    email: customer.email,
    role: "customer",
  });

  return {
    customer: sanitizeCustomer(customer),
    ...tokens,
  };
}

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw new UnauthorizedError("Invalid credentials");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new UnauthorizedError("Invalid credentials");

  const tokens = generateTokenPair({
    id: admin.id,
    email: admin.email,
    role: "admin",
  });

  return {
    admin: { id: admin.id, email: admin.email, name: admin.name },
    ...tokens,
  };
}

export async function refreshCustomerToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  if (payload.role !== "customer") throw new UnauthorizedError("Invalid token");

  const customer = await prisma.customer.findUnique({
    where: { id: payload.id },
  });
  if (!customer) throw new UnauthorizedError("User not found");

  const accessToken = generateAccessToken({
    id: customer.id,
    email: customer.email,
    role: "customer",
  });

  return { accessToken, customer: sanitizeCustomer(customer) };
}

export async function generatePasswordResetToken(email: string) {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return null; // Don't reveal whether email exists

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.customer.update({
    where: { id: customer.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  return { token, email: customer.email, name: customer.name };
}

export async function resetPassword(token: string, newPassword: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!customer) throw new UnauthorizedError("Invalid or expired reset token");

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: "Password reset successful" };
}

export async function getCustomerProfile(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      wishlistItems: { include: { painting: true } },
    },
  });
  if (!customer) throw new NotFoundError("Customer");
  return sanitizeCustomer(customer, true);
}

export async function updateCustomerProfile(
  customerId: string,
  data: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }
) {
  const customer = await prisma.customer.update({
    where: { id: customerId },
    data,
  });
  return sanitizeCustomer(customer);
}

function sanitizeCustomer(customer: Record<string, unknown>, withRelations: boolean = false) {
  const { password, resetToken, resetTokenExpiry, ...rest } = customer;
  return rest;
}
