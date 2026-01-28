import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { artworks } from '../data/artworks'
import ArtworkModal from './ArtworkModal'
import { useTranslation } from 'react-i18next'
import { Instagram } from 'lucide-react'

const categories = ['all', 'realism', 'pets', 'portraits']

export default function MasonryGallery() {
  const { t } = useTranslation()
  const [active, setActive] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered =
    active === 'all'
      ? artworks
      : artworks.filter(a => a.category === active)

  return (
    <>
      <div className="flex gap-6 mb-10 text-sm">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={active === cat ? 'opacity-100' : 'opacity-40'}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <motion.div layout className="columns-2 md:columns-3 gap-4 space-y-4">
        <AnimatePresence>
          {filtered.map(art => (
            <motion.figure
              layout
              key={art.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="break-inside-avoid cursor-pointer"
              onClick={() => setSelected(art)}
            >
              <img src={art.src} className="rounded-xl mb-2" />
              <figcaption className="text-xs text-muted">{art.title}</figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      <ArtworkModal art={selected} onClose={() => setSelected(null)} />


    {/* Instagram link */}
    <section className="pb-24 pt-12 flex justify-center">
        <motion.a
            href="https://instagram.com/jugbvargas"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="
            inline-flex
            items-center
            gap-3
            text-sm
            uppercase
            tracking-widest
            text-foreground
            opacity-70
            hover:opacity-100
            transition
            "
        >
            <Instagram size={18} />
            <span>
            {t('followOnInstagram') || 'See more on Instagram →'}
            </span>
        </motion.a>
    </section>
    </>
  )
}
