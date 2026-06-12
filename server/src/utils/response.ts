import type { Response } from "express";

interface SuccessResponse {
  success: true;
  message: string;
  data?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export function sendSuccess(
  res: Response,
  data: unknown,
  message: string = "OK",
  statusCode: number = 200,
  meta?: SuccessResponse["meta"]
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export function paginate(query: { page?: string; limit?: string }) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "12", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResponse(data: unknown[], total: number, page: number, limit: number) {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
