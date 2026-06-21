# 📧 Email Service Quick Reference

## For ArtGallery Project

### Backend Environment Variables (Render)

Add to your Render environment variables:

```env
EMAIL_SERVICE_URL=https://your-email-service.vercel.app
ADMIN_MAIL=chayansehgal3@gmail.com
```

### Email Service Environment Variables (Vercel/Railway)

Add to your email service deployment:

```env
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
```

---

## Gmail Setup for App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Create a new App Password for "Mail"
5. Copy the 16-character password
6. Use this as `MAIL_PASS` in your email service

---

## Deployment Commands

### Deploy Email Service to Vercel
```bash
cd email-app
npm install
vercel
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Test Email Service
```bash
curl -X POST https://your-email-service.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "body": "<h1>Test Email</h1>"
  }'
```

---

## Folder Structure

```
ArtGallery/
├── email-app/                    # Email service (deploy to Vercel)
│   ├── app/api/send-email/      # API endpoint
│   ├── lib/
│   │   ├── nodemailer.ts        # Singleton transporter
│   │   └── email.ts             # Send email function
│   └── .env.local               # MAIL_USER, MAIL_PASS
│
├── server/                       # ArtGallery backend (deploy to Render)
│   ├── src/services/
│   │   └── emailService.ts      # Calls email service API
│   └── .env                     # EMAIL_SERVICE_URL
│
└── EMAIL_SERVICE_SETUP.md       # Full documentation
```

---

## How It Works

1. **User submits form** on ArtGallery website with images
2. **Frontend sends** form data to ArtGallery backend (Render)
3. **Backend calls** email service API with FormData + images
4. **Email service** (Vercel) sends email via Gmail SMTP
5. **Admin receives** email with images attached

---

## Why This Setup?

- ❌ Render blocks SMTP ports (25, 465, 587)
- ✅ Vercel/Railway allow SMTP
- ✅ Separate email service can be reused
- ✅ Better scalability and error handling
- ✅ Free tier friendly on both platforms

---

## Troubleshooting

**Email not sending?**
- Check `MAIL_USER` and `MAIL_PASS` are set correctly in email service
- Verify Gmail App Password is correct
- Check email service logs on Vercel

**Backend can't reach email service?**
- Verify `EMAIL_SERVICE_URL` is correct (no trailing slash)
- Test email service endpoint directly with curl

**Images not attaching?**
- Verify `form-data` is installed in backend: `npm install form-data`
- Check backend logs for errors
