import en from '@vueform/vueform/locales/en'
import tailwind from '@vueform/vueform/dist/tailwind'
import { defineConfig } from '@vueform/vueform'

export default defineConfig({
  theme: tailwind,
  locales: { en },
  locale: 'en',
  apiKey: '', // Add your VueForm API key if you have one (optional for builder)
  // Basic field types we'll use
  elements: [
    'text',
    'email', 
    'number',
    'textarea',
    'select',
  ],
})