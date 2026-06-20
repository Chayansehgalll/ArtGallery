import { Router } from "express";
import { uploadImages } from "../middleware/upload.js";
import { sendCustomPaintingEmail } from "../services/emailService.js";
import type { Request, Response } from "express";

const router = Router();

// Simple custom painting request handler
router.post("/", uploadImages, async (req: Request, res: Response) => {
  try {
    const { name, phone, frameType, estimatedSize, notes } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    // Log the request details
    console.log("\n🎨 ═══════════════════════════════════════════════════════");
    console.log("   NEW CUSTOM PAINTING REQUEST");
    console.log("═══════════════════════════════════════════════════════\n");
    console.log(`👤 Name: ${name}`);
    console.log(`📞 Phone: ${phone}`);
    console.log(`🖼️  Frame: ${frameType}`);
    console.log(`📏 Size: ${estimatedSize}`);
    if (notes) console.log(`📝 Notes: ${notes}`);
    console.log(`📷 Images: ${files?.length || 0} uploaded`);
    console.log("\n💌 Sending email to: ankurbhardwaj869@gmail.com");
    console.log("═══════════════════════════════════════════════════════\n");

    // Send email
    try {
      await sendCustomPaintingEmail({
        name,
        phone,
        frameType,
        estimatedSize,
        notes: notes || "",
        imageCount: files?.length || 0,
      }, files);
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Continue even if email fails
    }

    // Send success response
    res.json({
      success: true,
      message: "Custom painting request received successfully!",
      data: {
        name,
        phone,
        imageCount: files?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
    });
  }
});

export default router;
