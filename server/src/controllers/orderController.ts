import type { Request, Response, NextFunction } from "express";
import * as orderService from "../services/orderService.js";
import { sendSuccess, paginate } from "../utils/response.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validations/order.js";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(req.user!.id, data);
    sendSuccess(res, order, "Order placed successfully", 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getCustomerOrders(req.user!.id);
    sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id);
    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
}

// Admin
export async function getAllOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = paginate(req.query as { page?: string; limit?: string });
    const result = await orderService.getAllOrders({
      page,
      limit,
      status: req.query.status as string,
    });
    sendSuccess(res, result.data, "Orders fetched", 200, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = updateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(req.params.id, status);
    sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await orderService.getDashboardStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    sendSuccess(res, order);
  } catch (err) {
    next(err);
  }
}

/** Admin — orders awaiting manual payment verification */
export async function getPendingPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getPendingPayments();
    sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
}

/** Admin — approve or reject a payment reference */
export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const approved = req.body.approved !== false;
    const order = await orderService.verifyOrderPayment(req.params.id, approved);
    sendSuccess(res, order, approved ? "Payment verified — order confirmed" : "Payment rejected — order cancelled");
  } catch (err) {
    next(err);
  }
}
