import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fix V3 (Security Misconfiguration): send HTTP security headers from the
  // frontend so ZAP no longer flags missing CSP / anti-clickjacking on the
  // rendered pages. CSP is scoped to allow the app's own assets, the remote
  // restaurant logos, Google Fonts, and calls to the API gateway.
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy':
        "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self' http://localhost:8082",
    },
  },
})
