# Email Service Integration Setup

This guide explains how to set up the email service to bypass SMTP port blocking on Render.

## Problem

Render blocks SMTP ports (25, 465, 587), which prevents the ArtGallery backend from sending emails directly using nodemailer.

## Solution

We've created a separate Next.js email service (`email-app/`) that:
1. Runs on a platform that allows SMTP (Vercel, Railway, or any VPS)
2. Accepts email requests via API
3. Sends emails using nodemailer with SMTP
4. The ArtGallery backend calls this API instead of using SMTP directly

## Architecture

```
ArtGallery Frontend (Vercel)
        ↓
ArtGallery Backend (Render) - SMTP blocked ❌
        ↓
    API Call
        ↓
Email Service (Vercel/Railway) - SMTP works ✅
        ↓
    Gmail SMTP
```

## Setup Steps

### 1. Deploy the Email Service

#### Option A: Deploy to Vercel (Recommended)

```bash
cd email-app
npm install
vercel
```

Follow the prompts to deploy. After deployment, you'll get a URL like:
`https://your-email-service.vercel.app`

#### Option B: Deploy to Railway

```bash
cd email-app
npm install
# Connect to Railway and deploy
railway up
```

### 2. Configure Email Service Environment Variables

In your email service deployment platform (Vercel/Railway), add these environment variables:

```env
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
```

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use this app password as `MAIL_PASS`

### 3. Configure ArtGallery Backend

Add this to your ArtGallery backend `.env` file (on Render):

```env
EMAIL_SERVICE_URL=https://your-email-service.vercel.app
ADMIN_MAIL=chayansehgal3@gmail.com
```

**Important:** Remove or comment out the old SMTP variables (they're not needed anymore):
```env
# SMTP_HOST=smtp.gmail.com    # Not needed
# SMTP_PORT=587                # Not needed
# SMTP_USER=                   # Not needed
# SMTP_PASS=                   # Not needed
```

### 4. Install Dependencies on Backend

```bash
cd server
npm install form-data
```

This is already added to `package.json`, so just run `npm install` if you haven't.

### 5. Deploy Changes

1. Commit and push your changes
2. Render will automatically redeploy your backend
3. The email service should now work!

## Testing

### Test the Email Service Directly

```bash
curl -X POST https://your-email-service.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "<h1>Test</h1><p>This is a test email.</p>"
  }'
```

### Test from ArtGallery Frontend

1. Go to your ArtGallery website
2. Navigate to "Custom Painting Request" page
3. Fill out the form and upload images
4. Submit the form
5. Check if the email arrives at the admin email address

## How It Works

### Before (Direct SMTP - Blocked on Render)
```typescript
// server/src/services/emailService.ts
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,  // ❌ Blocked on Render
  // ...
});
await transporter.sendMail({...});
```

### After (API Call - Works on Render)
```typescript
// server/src/services/emailService.ts
const formData = new FormData();
formData.append('to', 'admin@example.com');
formData.append('subject', 'New Request');
formData.append('body', htmlContent);
formData.append('attachments', imageBuffer);

// Call the email service API
await fetch(`${EMAIL_SERVICE_URL}/api/send-email`, {
  method: 'POST',
  body: formData,
});
```

## API Endpoints

### POST /api/send-email

Sends an email with optional attachments.

**Request (JSON):**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "<h1>HTML Content</h1>",
  "isHtml": true
}
```

**Request (FormData with attachments):**
```javascript
const formData = new FormData();
formData.append('to', 'recipient@example.com');
formData.append('subject', 'Email Subject');
formData.append('body', '<h1>HTML Content</h1>');
formData.append('isHtml', 'true');
formData.append('attachments', fileBuffer, {
  filename: 'image.jpg',
  contentType: 'image/jpeg'
});
```

**Response:**
```json
{
  "success": true,
  "messageId": "<message-id@gmail.com>",
  "message": "Email sent successfully"
}
```

## Troubleshooting

### Email not sending from email service

1. Check environment variables on Vercel/Railway:
   - `MAIL_USER` should be your Gmail address
   - `MAIL_PASS` should be your Gmail App Password (not your regular password)

2. Check Gmail settings:
   - 2-factor authentication must be enabled
   - App Password must be generated and used

### Backend can't reach email service

1. Check `EMAIL_SERVICE_URL` in Render environment variables
2. Make sure the URL is correct (no trailing slash)
3. Check email service logs for errors

### Images not attached

1. Make sure images are being uploaded correctly to the backend
2. Check that `form-data` package is installed
3. Check email service logs to see if attachments are received

## Benefits

✅ **Bypasses Render's SMTP port block**
✅ **Supports image attachments**
✅ **Centralized email sending** (can be reused for other projects)
✅ **Better error handling and logging**
✅ **Scalable** (Vercel/Railway auto-scaling)
✅ **Free tier friendly**

## Cost

- **Vercel Free Tier:** 100GB bandwidth/month, unlimited function invocations
- **Railway Free Tier:** $5 credit/month (should be enough for email service)
- Both are more than sufficient for small to medium traffic

## Security Notes

- Never commit `.env` files to git
- Use environment variables for all secrets
- The email service API is public, but it doesn't expose credentials
- Consider adding API key authentication if needed in the future
