import { Router } from "express";
import * as ctrl from "../controllers/paintingController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", ctrl.getAll);
router.get("/featured", ctrl.getFeatured);
router.get("/gallery", ctrl.getGallery);
router.get("/related/:id", ctrl.getRelated);
router.get("/:slug", ctrl.getBySlug);
router.get("/id/:id", ctrl.getById);

export default router;
