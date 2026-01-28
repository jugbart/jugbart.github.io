import { useTranslation } from 'react-i18next'
import profileImage from '../assets/profile.jpg'

export default function About() {
  const { t } = useTranslation()

  return (
    <main className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12">
      <img src={profileImage} className="rounded-2xl" />
      <div>
        <h2 className="text-4xl mb-6">{t('about')}</h2>
        <p className="text-muted leading-relaxed">{t('aboutText')}</p>
      </div>
    </main>
  )
}
