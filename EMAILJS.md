# EmailJS setup (Contact form attachments)

This project uses EmailJS to allow sending the contact form with attachments directly from the browser.

Quick setup

1. Install the client library:

```bash
npm install @emailjs/browser
```

2. Sign up at https://www.emailjs.com/ and create a Service + Email Template.
   - Make sure your template expects variables like `from_name`, `reply_to`, and `message`.
   - File inputs should be named `attachment` (the form already uses this name).

3. Add environment variables (in `.env` or `.env.local`) and restart dev server:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
# Optional: if your EmailJS template expects a recipient field (e.g. `to_email`), you can set it here
VITE_CONTACT_RECIPIENT=artist@example.com
```

4. Start the dev server and test the contact form.

Notes
- The contact form enforces a 10 MB total attachment limit.
- EmailJS has a limit on the total size of template variables (≈50 KB). Attachments are sent as multipart data, but they may be counted toward total request size when encoded — for example, a binary file becomes larger when base64-encoded (roughly 4/3 the original size).

Workarounds if you hit the 50 KB limit:
- Attach smaller files or shorten the message text.
- Upload files to an external storage (S3, Cloudinary, etc.) and send only the file URLs in the email body.
- Move sending to a server endpoint that can handle larger payloads and send the email server-side.
- Add client-side checks to estimate total size (the app already warns when total variables exceed 50 KB) and refuse to send.

