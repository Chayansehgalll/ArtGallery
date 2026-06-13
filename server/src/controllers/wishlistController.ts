import type { Request, Response, NextFunction } from "express";
import * as wishlistService from "../services/wishlistService.js";
import { sendSuccess } from "../utils/response.js";

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const wishlist = await wishlistService.getWishlist(req.user!.id);
    sendSuccess(res, wishlist);
  } catch (err) {
    next(err);
  }
}

export async function toggle(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await wishlistService.toggleWishlist(
      req.user!.id,
      req.params.paintingId as string
    );
    sendSuccess(res, result, result.inWishlist ? "Added to wishlist" : "Removed from wishlist");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await wishlistService.removeFromWishlist(
      req.user!.id,
      req.params.paintingId as string
    );
    sendSuccess(res, null, "Removed from wishlist");
  } catch (err) {
    next(err);
  }
}
