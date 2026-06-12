import prisma from "../config/prisma.js";

const PAYMENT_KEYS = ["payment.upiId", "payment.payeeName", "payment.qrImage", "payment.instructions"] as const;

const DEFAULTS: Record<string, string> = {
  "payment.upiId": "7042089820@upi",
  "payment.payeeName": "Yashika's Gallery",
  "payment.qrImage": "",
  "payment.instructions":
    "Scan the QR code or pay directly to the UPI ID. After completing the payment, enter the UPI Transaction ID below and place your order. Your order will be confirmed once the payment is verified.",
};

export async function getPaymentSettings() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: [...PAYMENT_KEYS] } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    upiId: map.get("payment.upiId") || DEFAULTS["payment.upiId"],
    payeeName: map.get("payment.payeeName") || DEFAULTS["payment.payeeName"],
    qrImage: map.get("payment.qrImage") || undefined,
    instructions: map.get("payment.instructions") || DEFAULTS["payment.instructions"],
  };
}

export async function updatePaymentSettings(data: {
  upiId?: string;
  payeeName?: string;
  qrImage?: string;
  instructions?: string;
}) {
  const entries: [string, string | undefined][] = [
    ["payment.upiId", data.upiId],
    ["payment.payeeName", data.payeeName],
    ["payment.qrImage", data.qrImage],
    ["payment.instructions", data.instructions],
  ];

  for (const [key, value] of entries) {
    if (value === undefined) continue;
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  return getPaymentSettings();
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
