/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#08111f',
        slateblue: '#12213c',
        neon: '#7dd3fc',
        mint: '#34d399',
        ember: '#fb923c'
      },
      boxShadow: {
        soft: '0 24px 60px rgba(8, 17, 31, 0.22)'
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top right, rgba(125, 211, 252, 0.14), transparent 30%), radial-gradient(circle at bottom left, rgba(52, 211, 153, 0.12), transparent 28%)'
      }
    }
  },
  plugins: []
};
