import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function ArtworkModal({ art, onClose }) {
  return (
    <AnimatePresence>
      {art && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button className="absolute top-6 right-6 text-white">
            <X size={32} />
          </button>

          <motion.img
            src={art.src}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-h-[90vh] rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
