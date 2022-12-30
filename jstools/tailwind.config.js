/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true
  },
  content: {
      relative: true,
      files: [
       '../**/templates/*.html',
      '../**/templates/**/*.html'
      ]
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
