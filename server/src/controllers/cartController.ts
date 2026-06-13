import type { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cartService.js";
import { sendSuccess } from "../utils/response.js";

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.user!.id);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { paintingId, quantity = 1, frame } = req.body;
    const item = await cartService.addToCart(req.user!.id, paintingId, quantity, frame);
    sendSuccess(res, item, "Added to cart", 201);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantity } = req.body;
    const item = await cartService.updateCartItem(
      req.user!.id,
      req.params.id as string,
      quantity
    );
    sendSuccess(res, item, "Cart updated");
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.removeFromCart(
      req.user!.id,
      req.params.id as string
    );
    sendSuccess(res, null, "Item removed from cart");
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.clearCart(req.user!.id);
    sendSuccess(res, null, "Cart cleared");
  } catch (err) {
    next(err);
  }
}
