import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // App errors (operational)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Intercept and print structured Zod validation responses perfectly
  if (err instanceof ZodError || (err && (err.name === "ZodError" || Array.isArray(err.errors)))) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: (err.errors || []).map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Unknown generic errors
  console.error("Unhandled server exception context:", err);
  return res.status(500).json({
    success: false,
    message: env.nodeEnv === "production" ? "Internal server error" : err.message || "An unexpected error occurred",
  });
}