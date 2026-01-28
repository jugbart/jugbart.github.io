import { motion } from 'framer-motion'
import MasonryGallery from '../components/MasonryGallery'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()

  return (
    <main className="max-w-7xl mx-auto px-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="min-h-[70vh] flex flex-col justify-center"
      >
        <h1 className="text-6xl mb-6">{t('title')}</h1>
        <p className="text-muted max-w-xl">{t('subtitle')}</p>
      </motion.section>

      {/* Gallery */}
      <section className="pb-12">
        <MasonryGallery />
      </section>

    </main>
  )
}
