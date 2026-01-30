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
- If you need server-side validation or large-file uploads, consider adding a backend endpoint instead of sending directly from the browser.
