import { Router } from "express";
import * as ctrl from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many attempts, try again later" },
});

router.post("/register", authLimiter, ctrl.register);
router.post("/login", authLimiter, ctrl.login);
router.post("/admin/login", authLimiter, ctrl.adminLogin);
router.post("/refresh-token", ctrl.refreshToken);
router.post("/forgot-password", authLimiter, ctrl.forgotPassword);
router.post("/reset-password", authLimiter, ctrl.resetPassword);
router.get("/profile", authenticate, ctrl.getProfile);
router.put("/profile", authenticate, ctrl.updateProfile);

export default router;
