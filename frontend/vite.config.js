import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/cypress/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'text-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/tests/**',
        'src/App.jsx',
        'src/components/Footer.jsx',
        'src/components/Navbar.jsx',
        'src/services/**',
        'src/pages/AdminPanel.jsx',
        'src/pages/Collections.jsx',
        'src/pages/GameDetail.jsx',
        'src/pages/GameJamsPage.jsx',
        'src/pages/Home.jsx',
        'src/pages/NotFound.jsx',
        'src/pages/PlayGame.jsx',
        'src/pages/Profile.jsx',
        'src/pages/SubmitGame.jsx'
      ],
    },
  },
})

