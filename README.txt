RS WEBFORGED COMPLETE WEBSITE

Upload this whole folder to GitHub and deploy with Vercel.

Before deploying:
1. Replace YOUR_TURNSTILE_SITE_KEY in contact.html with your Cloudflare Turnstile Site Key.
2. Add these environment variables in Vercel:
   RESEND_API_KEY
   TURNSTILE_SECRET_KEY
   TO_EMAIL
   FROM_EMAIL

For testing with Resend test sender:
FROM_EMAIL = RS WebForged <onboarding@resend.dev>
TO_EMAIL = the email address connected to your Resend account

For production after verifying your domain in Resend:
FROM_EMAIL = RS WebForged <hello@yourdomain.co.uk>
TO_EMAIL = enquiries@yourdomain.co.uk


Vercel project setup:
- The backend contact form is already in /api/contact.js.
- Resend is already installed in package.json.
- Cloudflare Turnstile is already loaded on contact.html.
- Replace YOUR_TURNSTILE_SITE_KEY in contact.html.
- Add RESEND_API_KEY, TURNSTILE_SECRET_KEY, FROM_EMAIL and TO_EMAIL in Vercel Environment Variables.
