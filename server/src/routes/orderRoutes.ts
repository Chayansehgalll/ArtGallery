import { Router } from "express";
import * as ctrl from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Customer routes
router.post("/", authenticate, ctrl.createOrder);
router.get("/mine", authenticate, ctrl.getMyOrders);
router.get("/mine/:id", authenticate, ctrl.getMyOrder);

export default router;
