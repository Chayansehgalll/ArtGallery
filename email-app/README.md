# Email Service - Next.js App

A Next.js application with a nodemailer singleton pattern for sending emails via API. **Designed to bypass SMTP port blocking on platforms like Render.**

## Features

- ✅ Nodemailer singleton pattern (single transporter instance)
- ✅ REST API endpoint for sending emails
- ✅ **Supports image attachments** (multipart/form-data)
- ✅ TypeScript support
- ✅ Input validation
- ✅ Support for both HTML and plain text emails
- ✅ Works on Vercel/Railway (platforms that allow SMTP)

## Quick Deploy

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

```bash
cd email-app
npm install
vercel
```

### Deploy to Railway

```bash
cd email-app
npm install
railway up
```

After deployment, set these environment variables in your platform:

```env
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
```

## Setup

1. **Install dependencies:**
   ```bash
   cd email-app
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-password
   ```

   **For Gmail:**
   - Enable 2-factor authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the app password as `MAIL_PASS`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Usage

### Endpoint
`POST /api/send-email`

### Request Body
```json
{
  "to": "recipient@example.com",
  "subject": "Your Subject",
  "body": "<h1>Hello!</h1><p>Your email content here</p>",
  "isHtml": true
}
```

### Parameters
- `to` (required): Recipient email address
- `subject` (required): Email subject
- `body` (required): Email content (HTML or plain text)
- `isHtml` (optional): Boolean, default is `true`. Set to `false` for plain text emails
- `attachments` (optional): File attachments (only with multipart/form-data)

### Example with Attachments (FormData)
```javascript
const formData = new FormData();
formData.append('to', 'recipient@example.com');
formData.append('subject', 'Email with Images');
formData.append('body', '<h1>Hello!</h1><p>Check out these images:</p>');
formData.append('isHtml', 'true');

// Attach images
const file1 = new File([imageBlob1], 'image1.jpg', { type: 'image/jpeg' });
const file2 = new File([imageBlob2], 'image2.jpg', { type: 'image/jpeg' });
formData.append('attachments', file1);
formData.append('attachments', file2);

const response = await fetch('http://localhost:3000/api/send-email', {
  method: 'POST',
  body: formData,
});
```

### Example from Node.js Backend (with form-data)
```javascript
import FormData from 'form-data';

const formData = new FormData();
formData.append('to', 'admin@example.com');
formData.append('subject', 'Custom Painting Request');
formData.append('body', '<h1>New Request</h1><p>Details...</p>');

// Attach files from multer upload
files.forEach((file) => {
  formData.append('attachments', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });
});

await fetch('https://your-email-service.vercel.app/api/send-email', {
  method: 'POST',
  body: formData,
  headers: formData.getHeaders(),
});
```

### Parameters
- `to` (required): Recipient email address
- `subject` (required): Email subject
- `body` (required): Email content (HTML or plain text)
- `isHtml` (optional): Boolean, default is `true`. Set to `false` for plain text emails

### Example using cURL
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "<h1>Hello!</h1><p>This is a test email.</p>",
    "isHtml": true
  }'
```

### Example using JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Test Email',
    body: '<h1>Hello!</h1><p>This is a test email.</p>',
    isHtml: true,
  }),
})

const data = await response.json()
console.log(data)
```

### Response
**Success (200):**
```json
{
  "success": true,
  "messageId": "<message-id>",
  "message": "Email sent successfully"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Project Structure

```
email-app/
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts        # API endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Home page with documentation
├── lib/
│   ├── email.ts               # Email service
│   └── nodemailer.ts          # Singleton transporter
├── .env.local                 # Environment variables (create this)
├── .env.example
├── next.config.js
├── package.json
└── tsconfig.json
```

## How the Singleton Pattern Works

The nodemailer transporter is created only once using a singleton pattern:

```typescript
// lib/nodemailer.ts
class NodemailerSingleton {
  private static instance: Transporter | null = null

  public static getInstance(): Transporter {
    if (!NodemailerSingleton.instance) {
      NodemailerSingleton.instance = nodemailer.createTransport({...})
    }
    return NodemailerSingleton.instance
  }
}

export const transporter = NodemailerSingleton.getInstance()
```

This ensures that all email sends reuse the same transporter instance, improving performance and resource management.

## Production Deployment

For production, set the environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Railway: Project → Variables
- Other platforms: Refer to their documentation

## License

MIT
