export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      colors: {
        background: 'rgb(var(--bg))',
        foreground: 'rgb(var(--fg))',
        muted: 'rgb(var(--muted))'
      }
    }
  },
  plugins: []
}
