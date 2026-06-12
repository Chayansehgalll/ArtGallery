import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as settingsService from "../services/settingsService.js";
import { sendSuccess } from "../utils/response.js";

const paymentSettingsSchema = z.object({
  upiId: z.string().min(3).optional(),
  payeeName: z.string().min(1).optional(),
  qrImage: z.string().optional(),
  instructions: z.string().optional(),
});

/** Public — checkout page fetches this */
export async function getPaymentSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getPaymentSettings();
    sendSuccess(res, settings);
  } catch (err) {
    next(err);
  }
}

/** Admin — update UPI ID, QR image, payee name, instructions */
export async function updatePaymentSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = paymentSettingsSchema.parse(req.body);
    const settings = await settingsService.updatePaymentSettings(data);
    sendSuccess(res, settings, "Payment settings updated");
  } catch (err) {
    next(err);
  }
}
