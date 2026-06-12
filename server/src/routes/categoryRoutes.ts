import { Router } from "express";
import * as ctrl from "../controllers/categoryController.js";

const router = Router();

router.get("/", ctrl.getAll);
router.get("/:slug", ctrl.getBySlug);

export default router;
