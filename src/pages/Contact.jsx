import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
// Use Cloudinary unsigned uploads as the default free solution

export default function Contact() {
  const { t } = useTranslation()
  const formRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  // Toast state for nicer success/error messages
  const [toast, setToast] = useState(null) // { message: string, type: 'success' | 'error' }

  const showToast = (message, type = 'success', duration = 4000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }

  // Upload state and progress map
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({}) // { idx: percent }

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10 MB

  // Helpers: Cloudinary upload (unsigned) and Firebase upload wrapper
  async function uploadToCloudinary(file, idx) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured')

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', uploadPreset)

      xhr.open('POST', url)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress((p) => ({ ...p, [idx]: percent }))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText)
            resolve(json.secure_url || json.url)
          } catch (err) {
            reject(new Error('Invalid response from Cloudinary'))
          }
        } else {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))

      xhr.send(fd)
    })
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const total = files.reduce((acc, f) => acc + f.size, 0)

    if (total > MAX_TOTAL_SIZE) {
      setError('Total attachments size exceeds 10 MB')
      e.target.value = ''
      setSelectedFiles([])
      return
    }

    setError(null)
    setSelectedFiles(files)
  }

  const handleRemoveFile = (index) => {
    const remaining = selectedFiles.filter((_, i) => i !== index)
    const dt = new DataTransfer()
    remaining.forEach((f) => dt.items.add(f))

    if (fileInputRef.current) fileInputRef.current.files = dt.files
    setSelectedFiles(Array.from(dt.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending || uploading) return
    setError(null)

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setError('Email service not configured. See README for setup steps.')
      return
    }

    const form = formRef.current

    // If files selected, upload to cloud (prefer Firebase if configured, otherwise Cloudinary)
    let uploadedUrls = []
    if (selectedFiles.length > 0) {
      setUploading(true)
      setUploadProgress({})
      try {
        uploadedUrls = await Promise.all(
          selectedFiles.map((f, i) => uploadToCloudinary(f, i))
        )

        // attach file URLs to the form as a hidden input
        let urlsInput = form.querySelector('input[name="file_urls"]')
        if (!urlsInput) {
          urlsInput = document.createElement('input')
          urlsInput.type = 'hidden'
          urlsInput.name = 'file_urls'
          form.appendChild(urlsInput)
        }
        urlsInput.value = uploadedUrls.join(', ')

        // Also add an HTML-friendly list of links that can be injected in the EmailJS template as {{{file_urls_html}}}
        let urlsHtmlInput = form.querySelector('input[name="file_urls_html"]')
        if (!urlsHtmlInput) {
          urlsHtmlInput = document.createElement('input')
          urlsHtmlInput.type = 'hidden'
          urlsHtmlInput.name = 'file_urls_html'
          form.appendChild(urlsHtmlInput)
        }
        urlsHtmlInput.value = `<ul>${uploadedUrls.map((u) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a></li>`).join('')}</ul>`

        // clear the file input so sendForm won't try to send raw files
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (err) {
        console.error('Upload failed', err)
        const msg = 'File upload failed. Try again or use smaller files.'
        setError(msg)
        showToast(msg, 'error')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    // attach a hidden field with comma-separated attachment names (useful in the email body)
    const attachmentNames = selectedFiles.map((f) => f.name).join(', ')

    let hiddenNames = form.querySelector('input[name="attachment_names"]')
    if (!hiddenNames) {
      hiddenNames = document.createElement('input')
      hiddenNames.type = 'hidden'
      hiddenNames.name = 'attachment_names'
      form.appendChild(hiddenNames)
    }
    hiddenNames.value = attachmentNames

    // set a per-submission order id (simple client-side counter stored in localStorage)
    try {
      const prev = Number(localStorage.getItem('orderCounter') || 0)
      const next = prev + 1
      localStorage.setItem('orderCounter', String(next))
      let orderInput = form.querySelector('input[name="order_id"]')
      if (!orderInput) {
        orderInput = document.createElement('input')
        orderInput.type = 'hidden'
        orderInput.name = 'order_id'
        form.appendChild(orderInput)
      }
      // format: ORD-000001
      orderInput.value = `ORD-${String(next).padStart(6, '0')}`
    } catch (e) {
      // localStorage may be unavailable; ignore silently
      console.warn('Could not set orderCounter', e)
    }

    // optionally set recipient if provided via env var
    const recipient = import.meta.env.VITE_CONTACT_RECIPIENT
    if (recipient) {
      let toInput = form.querySelector('input[name="to_email"]')
      if (!toInput) {
        toInput = document.createElement('input')
        toInput.type = 'hidden'
        toInput.name = 'to_email'
        form.appendChild(toInput)
      }
      toInput.value = recipient
    }

    // Estimate total size of variables to avoid EmailJS template variable limits (~50KB)
    // For files, we now send URLs (smaller) so this helps ensure variables remain under the limit
    const fd = new FormData(form)

    let totalBytes = 0
    for (const [k, v] of fd.entries()) {
      if (v instanceof File) {
        const fileSize = v.size || 0
        totalBytes += Math.ceil(fileSize / 3) * 4
      } else {
        totalBytes += new TextEncoder().encode(String(v)).length
      }
    }

    const MAX_VARS_BYTES = 50 * 1024
    if (totalBytes > MAX_VARS_BYTES) {
      const msg = 'Total message size exceeds the 50 KB variables limit. Try smaller attachments, shorten text, or upload files and send links.'
      setError(msg)
      showToast(msg, 'error')
      return
    }

    setSending(true)
    emailjs
      .sendForm(serviceId, templateId, form, publicKey)
      .then(() => {
        setSending(false)
        // show a nice success toast instead of default alert
        showToast(t('messageSent') || 'Message sent successfully!', 'success')
        form.reset()
        setSelectedFiles([])
        setUploadProgress({})
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setSending(false)
        // EmailJS often returns an object with `.text` when the request is rejected
        const errText = (err && (err.text || err.message)) || 'Failed to send message. Please try again later.'
        if (typeof errText === 'string' && errText.toLowerCase().includes('recipient')) {
          const msg = 'Recipient address is empty. Set a recipient in your EmailJS template or set VITE_CONTACT_RECIPIENT in your env.'
          setError(msg)
          showToast(msg, 'error')
        } else {
          setError(errText)
          showToast(errText, 'error')
        }
      })
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-24">
      <h2 className="text-4xl mb-8">{t('contact')}</h2>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          <div className="font-medium">{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            className="ml-3 rounded-md bg-white/10 px-2 py-1 text-sm hover:bg-white/20"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="from_name"
          placeholder={t('name')}
          className="border-b bg-transparent p-3"
          required
        />

        <input
          name="reply_to"
          type="email"
          placeholder={t('email')}
          className="border-b bg-transparent p-3"
          required
        />

        <textarea
          name="message"
          placeholder={t('message')}
          className="border-b bg-transparent p-3"
          rows={6}
          required
        />

        <div className="mt-4">
          <input
            ref={fileInputRef}
            id="attachment-input"
            type="file"
            name="attachment"
            multiple
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Attachments"
          />

          <div className="flex items-center gap-4">
            <label
              htmlFor="attachment-input"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-md border border-dashed border-muted bg-background hover:bg-foreground/5 cursor-pointer transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21.44 11.05L12.71 19.2a5 5 0 01-7.07 0 5 5 0 010-7.07L12 5" />
                <path d="M21 7v6" />
              </svg>
              <span className="text-sm text-muted-foreground">Add files (optional)</span>
            </label>

            <div className="text-sm text-muted-foreground">
              {selectedFiles.length === 0 ? (
                <span>No files selected</span>
              ) : (
                <span>
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} • {Math.round(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024)} KB
                </span>
              )}

              {uploading && <span className="ml-3 text-xs text-foreground">Uploading files…</span>}
            </div>

            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = ''
                  setSelectedFiles([])
                }}
                className="ml-auto text-sm text-red-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-3 grid gap-2">
            {selectedFiles.map((f, i) => (
              <div key={f.name + i} className="flex items-center gap-3 p-3 rounded-md bg-muted/20 border">
                <div className="flex-none h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-sm">
                  📎
                </div>

                <div className="truncate">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} KB</div>
                  {uploadProgress[i] != null && (
                    <div className="mt-2">
                      <div
                        role="progressbar"
                        aria-label={`Upload progress ${uploadProgress[i]}%`}
                        aria-valuenow={uploadProgress[i]}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        className="h-2 w-full bg-muted/40 rounded overflow-hidden"
                      >
                        <div className="h-full bg-foreground transition-all" style={{ width: `${uploadProgress[i]}%` }} />
                      </div>
                      <span className="sr-only">{uploadProgress[i]}% uploaded</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(i)}
                  className="ml-3 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={sending || uploading}
          className="mt-6 border px-6 py-3 hover:bg-foreground hover:text-background transition disabled:opacity-60"
        >
          {sending || uploading ? (t('sending') || 'Sending...') : t('send')}
        </button>
      </form>
    </main>
  )
}
