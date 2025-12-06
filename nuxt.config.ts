// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV !== 'production';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'TailAdmin - Vue.js Tailwind CSS Dashboard Template',
      titleTemplate: '%s | TailAdmin - Vue.js Tailwind CSS Dashboard Template',
      bodyAttrs: {
        class: 'dark:bg-gray-900',
      },
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
  },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxt/image', '@nuxtjs/tailwindcss', '@pinia/nuxt', 'nuxt-swiper'],
  css: ['flatpickr/dist/flatpickr.css', 'simplebar-vue/dist/simplebar.min.css', '@/assets/scss/main.scss'],
  routeRules: {
    '/**': isDev ? {} : { cache: { swr: true, maxAge: 120, staleMaxAge: 60, headersOnly: true } },
  },
  plugins: [{ src: '@/plugins/flatpickr.client.ts', mode: 'client' }],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      api: {
        baseURL: process.env.PUBLIC_BASE_URL,
        apiURL: process.env.PUBLIC_API_URL,
      },
    },
  },
});
