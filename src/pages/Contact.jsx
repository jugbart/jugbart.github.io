import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'

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

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10 MB

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (sending) return
    setError(null)

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setError('Email service not configured. See README for setup steps.')
      return
    }

    // attach a hidden field with comma-separated attachment names (useful in the email body)
    const form = formRef.current
    const attachmentNames = selectedFiles.map((f) => f.name).join(', ')

    let hiddenNames = form.querySelector('input[name="attachment_names"]')
    if (!hiddenNames) {
      hiddenNames = document.createElement('input')
      hiddenNames.type = 'hidden'
      hiddenNames.name = 'attachment_names'
      form.appendChild(hiddenNames)
    }
    hiddenNames.value = attachmentNames

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

    setSending(true)
    emailjs
      .sendForm(serviceId, templateId, form, publicKey)
      .then(() => {
        setSending(false)
        // show a nice success toast instead of default alert
        showToast(t('messageSent') || 'Message sent successfully!', 'success')
        form.reset()
        setSelectedFiles([])
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
          disabled={sending}
          className="mt-6 border px-6 py-3 hover:bg-foreground hover:text-background transition disabled:opacity-60"
        >
          {sending ? (t('sending') || 'Sending...') : t('send')}
        </button>
      </form>
    </main>
  )
}
