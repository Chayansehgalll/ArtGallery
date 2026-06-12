import { Router } from "express";
import * as ctrl from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getCart);
router.post("/", ctrl.addItem);
router.put("/:id", ctrl.updateItem);
router.delete("/:id", ctrl.removeItem);
router.delete("/", ctrl.clearCart);

export default router;
