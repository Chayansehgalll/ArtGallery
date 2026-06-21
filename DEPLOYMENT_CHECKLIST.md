# 🚀 Deployment Checklist

## ✅ Steps to Deploy Email Service Integration

### 1. Deploy Email Service (10 minutes)

- [ ] Navigate to `email-app` folder
- [ ] Install dependencies: `npm install`
- [ ] Deploy to Vercel: `vercel` (or Railway: `railway up`)
- [ ] Copy the deployment URL (e.g., `https://your-app.vercel.app`)
- [ ] Add environment variables in Vercel dashboard:
  - `MAIL_USER` = your Gmail address
  - `MAIL_PASS` = your Gmail App Password
- [ ] Test the endpoint:
  ```bash
  curl -X POST https://your-app.vercel.app/api/send-email \
    -H "Content-Type: application/json" \
    -d '{"to":"test@example.com","subject":"Test","body":"<h1>Test</h1>"}'
  ```

### 2. Update ArtGallery Backend (5 minutes)

- [ ] Go to Render dashboard for your ArtGallery backend
- [ ] Add environment variable:
  - `EMAIL_SERVICE_URL` = `https://your-app.vercel.app` (your email service URL from step 1)
  - `ADMIN_MAIL` = the email where you want to receive requests
- [ ] (Optional) Remove old SMTP variables:
  - Delete `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (not needed anymore)
- [ ] Trigger a redeploy on Render (or push your code changes)

### 3. Install Backend Dependencies (if not already done)

- [ ] In `server` folder, run: `npm install`
- [ ] Verify `form-data` is in dependencies
- [ ] Commit and push changes

### 4. Test End-to-End (5 minutes)

- [ ] Go to your ArtGallery website
- [ ] Navigate to "Custom Painting Request" page
- [ ] Fill out the form
- [ ] Upload 1-2 test images
- [ ] Submit the form
- [ ] Check if email arrives at `ADMIN_MAIL` address
- [ ] Verify images are attached to the email

### 5. Verify Logs

- [ ] Check Vercel logs for email service (should show email sent)
- [ ] Check Render logs for backend (should show API call to email service)
- [ ] Both should be error-free

---

## 📝 Environment Variables Summary

### Email Service (Vercel/Railway)
```env
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-16-char-app-password
```

### ArtGallery Backend (Render)
```env
EMAIL_SERVICE_URL=https://your-email-service.vercel.app
ADMIN_MAIL=chayansehgal3@gmail.com
```

---

## 🔧 Gmail App Password Setup

1. Go to: https://myaccount.google.com/
2. Security → 2-Step Verification → Enable it
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other" (name it "Email Service")
5. Click "Generate"
6. Copy the 16-character password
7. Use this as `MAIL_PASS`

---

## 🐛 Troubleshooting

### Email not sending
- ✅ Check `MAIL_USER` and `MAIL_PASS` in email service
- ✅ Verify Gmail App Password is correct
- ✅ Check Vercel/Railway logs for errors

### Backend errors
- ✅ Verify `EMAIL_SERVICE_URL` is correct (no trailing slash)
- ✅ Check `form-data` is installed: `npm list form-data`
- ✅ Check Render logs for API call errors

### Images not attaching
- ✅ Verify files are being uploaded to backend
- ✅ Check email service received attachments (check logs)
- ✅ Test with smaller images first

---

## 🎉 Done!

Once all checkboxes are ticked, your email service should be working perfectly!

**Estimated Total Time:** 20 minutes
