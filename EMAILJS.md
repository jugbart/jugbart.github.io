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

Cloudinary quick setup (unsigned upload from browser):

1. Create an unsigned upload preset in your Cloudinary account and note the preset name.
2. Add these environment variables to your `.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

3. The contact form will upload selected files to Cloudinary and include the generated URLs in the email as `{{file_urls}}`. The form also sets `file_urls_html` (an HTML list of links) which can be injected into your EmailJS HTML template using triple-stash: `{{{file_urls_html}}}`.

### Example EmailJS HTML template (use in the EmailJS dashboard)

Use this HTML template or adapt it — it includes the message, sender, and clickable file links (rendered via `{{{file_urls_html}}}`):

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>New Art Inquiry</title>
  </head>

  <body style="margin:0; padding:0; background-color:#fdfcfb; font-family: 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
      <tr>
        <td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#fde68a,#fbcfe8); padding:36px 40px;">
            <h1 style="margin:0; font-size:26px; font-weight:600; color:#1f2937;">✨ New Creative Inquiry</h1>
            <p style="margin:10px 0 0; font-size:14px; color:#4b5563;">Someone reached out through your art portfolio</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px; font-size:15px; color:#374151; line-height:1.6;">You’ve received a new message from someone interested in your work. Here are the details:</p>

            <!-- Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:12px 0; width:120px; font-weight:600; color:#111827;">👤 Name</td>
                <td style="padding:12px 0; color:#374151;">{{from_name}}</td>
              </tr>

              <tr>
                <td style="padding:12px 0; font-weight:600; color:#111827;">📧 Email</td>
                <td style="padding:12px 0;"><a href="mailto:{{reply_to}}" style="color:#be185d; text-decoration:none; font-weight:500;">{{reply_to}}</a></td>
              </tr>
            </table>

            <!-- Message -->
            <div style="margin-top:24px;">
              <p style="margin:0 0 12px; font-size:15px; font-weight:600; color:#111827;">💬 Message</p>
              <div style="background:#fff7ed; padding:20px 22px; border-radius:12px; border:1px solid #fde68a; color:#374151; font-size:14.5px; line-height:1.7;">{{message}}</div>
            </div>

            <!-- Attachments (if any) -->
            <div style="margin-top:24px; font-size:14px; color:#374151;">
              <p style="margin:0 0 8px; font-weight:600;">📎 Attachments / Reference files</p>
              {{{file_urls_html}}}
            </div>

            <p style="margin-top:36px; font-size:13px; color:#6b7280;">If files were attached, they are available as links above.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fafafa; padding:26px 32px; text-align:center;">
            <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.5;">This message was sent from your portfolio contact page<br />✨ Creating beauty, one piece at a time</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>


  </body>
</html>
```

### Make replies go to the sender's email
In the EmailJS Template settings (Dashboard → Email Templates → *your template*) set the **Reply-To** field to `{{reply_to}}`. This will cause replies to the email notification to be addressed to the form email submitted by the user.

Also confirm your form includes an input named `reply_to` (the project already uses `name="reply_to"` in `src/pages/Contact.jsx`).

Notes:
- `{{file_urls}}` is a simple comma-separated string of URLs (useful in plain-text templates). `{{{file_urls_html}}}` renders the clickable list above in HTML templates (triple curly braces allow HTML).
- If you prefer the files attached to the email instead of links, EmailJS supports attachments but that can run into size limits — links are recommended for large files.


