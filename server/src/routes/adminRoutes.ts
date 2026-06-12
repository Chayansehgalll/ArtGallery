import { Router } from "express";
import * as paintingCtrl from "../controllers/paintingController.js";
import * as orderCtrl from "../controllers/orderController.js";
import * as categoryCtrl from "../controllers/categoryController.js";
import * as settingsCtrl from "../controllers/settingsController.js";
import * as uploadCtrl from "../controllers/uploadController.js";
import { authenticate, adminOnly } from "../middleware/auth.js";
import { uploadImages, uploadPaintingImages, parseFormDataJson } from "../middleware/upload.js";

const router = Router();

router.use(authenticate, adminOnly);

// Dashboard
router.get("/dashboard", orderCtrl.getDashboard);

// Image upload (returns hosted URLs — Cloudinary or local fallback)
router.post("/upload", uploadImages, uploadCtrl.uploadImages);

// Paintings (accept multipart with coverImage, mainImage, and images fields)
router.post("/paintings", uploadPaintingImages, parseFormDataJson, paintingCtrl.create);
router.put("/paintings/:id", uploadPaintingImages, parseFormDataJson, paintingCtrl.update);
router.delete("/paintings/:id", paintingCtrl.remove);

// Orders
router.get("/orders", orderCtrl.getAllOrders);
router.get("/orders/pending-payments", orderCtrl.getPendingPayments);
router.get("/orders/:id", orderCtrl.getOrderById);
router.put("/orders/:id/status", orderCtrl.updateStatus);
router.put("/orders/:id/verify-payment", orderCtrl.verifyPayment);

// Categories
router.post("/categories", categoryCtrl.create);
router.put("/categories/:id", categoryCtrl.update);
router.delete("/categories/:id", categoryCtrl.remove);

// Settings (payment configuration — UPI ID, QR image, instructions)
router.get("/settings/payment", settingsCtrl.getPaymentSettings);
router.put("/settings/payment", settingsCtrl.updatePaymentSettings);

export default router;