import type { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/categoryService.js";
import { sendSuccess } from "../utils/response.js";
import { createCategorySchema, updateCategorySchema } from "../validations/painting.js";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getAllCategories();
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryBySlug(
      req.params.slug as string
    );
    sendSuccess(res, category);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);
    sendSuccess(res, category, "Category created", 201);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(
      req.params.id as string,
      data
    );
    sendSuccess(res, category, "Category updated");
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await categoryService.deleteCategory(
      req.params.id as string
    );
    sendSuccess(res, null, "Category deleted");
  } catch (err) {
    next(err);
  }
}
