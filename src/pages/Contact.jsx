import { useTranslation } from 'react-i18next'

export default function Contact() {
  const { t } = useTranslation()

  return (
    <main className="max-w-xl mx-auto px-6 py-24">
      <h2 className="text-4xl mb-8">{t('contact')}</h2>

      <form className="flex flex-col gap-4">
        <input placeholder={t('name')} className="border-b bg-transparent p-3" />
        <input placeholder={t('email')} className="border-b bg-transparent p-3" />
        <textarea placeholder={t('message')} className="border-b bg-transparent p-3" />

        <button className="mt-6 border px-6 py-3 hover:bg-foreground hover:text-background transition">
          {t('send')}
        </button>
      </form>
    </main>
  )
}
