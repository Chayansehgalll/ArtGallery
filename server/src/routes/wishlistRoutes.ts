import { Router } from "express";
import * as ctrl from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getWishlist);
router.post("/:paintingId", ctrl.toggle);
router.delete("/:paintingId", ctrl.remove);

export default router;
