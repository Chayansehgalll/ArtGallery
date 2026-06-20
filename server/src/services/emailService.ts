import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendCustomPaintingEmail(
  data: {
    name: string;
    phone: string;
    frameType: string;
    estimatedSize: string;
    notes: string;
    imageCount: number;
  },
  files?: Express.Multer.File[]
) {
  // Check if SMTP is configured
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    console.log("⚠️  SMTP not configured - skipping email");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #1a1a1a; border-bottom: 3px solid #000; padding-bottom: 10px; font-size: 24px; }
        .field { margin: 15px 0; padding: 12px; background: #f9f9f9; border-left: 4px solid #000; }
        .field strong { display: block; margin-bottom: 5px; color: #000; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
        .field span { color: #555; font-size: 14px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎨 New Custom Painting Request</h1>
        
        <div class="field">
          <strong>Customer Name</strong>
          <span>${data.name}</span>
        </div>
        
        <div class="field">
          <strong>Phone Number</strong>
          <span>${data.phone}</span>
        </div>
        
        <div class="field">
          <strong>Frame Type</strong>
          <span>${data.frameType}</span>
        </div>
        
        <div class="field">
          <strong>Estimated Size</strong>
          <span>${data.estimatedSize}</span>
        </div>
        
        ${data.notes ? `
        <div class="field">
          <strong>Additional Notes</strong>
          <span>${data.notes}</span>
        </div>
        ` : ''}
        
        <div class="field">
          <strong>Reference Images</strong>
          <span>${data.imageCount} image(s) attached to this email</span>
        </div>
        
        <div class="footer">
          <p>This is an automated message from Yashika Gallery</p>
          <p>Received: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Prepare attachments
  const attachments = files?.map((file, index) => ({
    filename: file.originalname || `reference-image-${index + 1}.${file.mimetype.split('/')[1]}`,
    content: file.buffer,
    contentType: file.mimetype,
  })) || [];

  await transporter.sendMail({
    from: `"Yashika Gallery" <${env.smtpUser}>`,
    to: env.adminEmail || "ankurbhardwaj869@gmail.com",
    subject: `🎨 New Custom Painting Request - ${data.name}`,
    html: htmlContent,
    attachments: attachments,
  });

  console.log("✅ Email sent successfully with attachments!");
}
