import { Router } from "express";
import * as ctrl from "../controllers/settingsController.js";

const router = Router();

// Public — used by the checkout page
router.get("/payment", ctrl.getPaymentSettings);

export default router;
