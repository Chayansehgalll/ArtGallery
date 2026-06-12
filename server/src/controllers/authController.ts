import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } from "../validations/auth.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.createCustomer(data);
    sendSuccess(res, result, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginCustomer(data.email, data.password);
    sendSuccess(res, result, "Login successful");
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginAdmin(data.email, data.password);
    sendSuccess(res, result, "Admin login successful");
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, "Refresh token required", 400);
    const result = await authService.refreshCustomerToken(token);
    sendSuccess(res, result, "Token refreshed");
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.generatePasswordResetToken(email);
    // Always return success to prevent email enumeration
    sendSuccess(res, null, "If the email exists, a reset link has been sent");
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(token, password);
    sendSuccess(res, result, "Password reset successful");
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await authService.getCustomerProfile(req.user!.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const profile = await authService.updateCustomerProfile(req.user!.id, data);
    sendSuccess(res, profile, "Profile updated");
  } catch (err) {
    next(err);
  }
}
