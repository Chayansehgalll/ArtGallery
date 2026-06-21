import { env } from "../config/env.js";

/**
 * Send custom painting request email via external email service API
 * This avoids SMTP port blocking issues on platforms like Render
 */
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
  // Check if email service URL is configured
  if (!env.emailServiceUrl) {
    console.log("⚠️  Email service URL not configured - skipping email");
    return;
  }

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

  try {
    // Use FormData to send email with attachments
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    formData.append('to', env.adminEmail || 'chayansehgal3@gmail.com');
    formData.append('subject', `🎨 New Custom Painting Request - ${data.name}`);
    formData.append('body', htmlContent);
    formData.append('isHtml', 'true');

    // Attach image files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('attachments', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    console.log(`📧 Sending email to ${env.adminEmail} via email service...`);
    
    // Call the email service API
    const response = await fetch(`${env.emailServiceUrl}/api/send-email`, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: string };
      throw new Error(`Email service error: ${errorData.error || response.statusText}`);
    }

    const result = await response.json() as { success: boolean; messageId: string; message: string };
    console.log("✅ Email sent successfully via email service!", result.messageId);
    
    return result;
  } catch (error) {
    console.error("❌ Failed to send email via email service:", error);
    throw error;
  }
}
