import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <select
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-transparent border text-sm"
    >
      <option value="en">EN</option>
      <option value="pt">PT</option>
      <option value="es">ES</option>
    </select>
  )
}
