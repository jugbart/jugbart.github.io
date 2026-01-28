import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-background/70">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
        to="/"
        className="flex items-center gap-3"
        onClick={() => setOpen(false)}
        >
            <img
                src="/logo.svg"
                alt="Jugb Art logo"
                className="w-8 h-8"
            />
            <span className="text-xl md:text-2xl font-display">
                Jugb Art
            </span>
        </Link>



        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 items-center text-sm">
          <Link to="/about">{t('about')}</Link>
          <Link to="/contact">{t('contact')}</Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-6">
          <div className="flex flex-col gap-4 text-sm">
            <Link
              to="/about"
              onClick={() => setOpen(false)}
            >
              {t('about')}
            </Link>

            <Link
              to="/contact"
              onClick={() => setOpen(false)}
            >
              {t('contact')}
            </Link>

            <div className="flex gap-4 items-center pt-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
