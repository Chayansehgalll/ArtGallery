import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Admin ───
  const adminPassword = await bcrypt.hash(env.adminPassword, 12);
  const admin = await prisma.admin.upsert({
    where: { email: env.adminEmail },
    update: {},
    create: {
      email: env.adminEmail,
      password: adminPassword,
      name: "Yashika",
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── Categories ───
  const categories = [
    { name: "Abstract", slug: "abstract", order: 1 },
    { name: "Landscape", slug: "landscape", order: 2 },
    { name: "Portrait", slug: "portrait", order: 3 },
    { name: "Floral", slug: "floral", order: 4 },
    { name: "Modern", slug: "modern", order: 5 },
    { name: "Minimal", slug: "minimal", order: 6 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created");

  // ─── Coupon ───
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 5000,
      maxUses: 100,
      isActive: true,
    },
  });
  console.log("✅ Coupon: WELCOME10 (10% off orders above ₹5,000)");

  // ─── Payment Settings ───
  const paymentDefaults: Record<string, string> = {
    "payment.upiId": "7042089820@upi",
    "payment.payeeName": "Yashika's Gallery",
    "payment.instructions":
      "Scan the QR code or pay directly to the UPI ID. After completing the payment, enter the UPI Transaction ID below and place your order. Your order will be confirmed once the payment is verified.",
  };
  for (const [key, value] of Object.entries(paymentDefaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✅ Payment settings (UPI) — editable from admin panel");

  console.log("\n🎨 Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
