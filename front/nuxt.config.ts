// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-mcp',
    '@pinia/nuxt'
  ],

  runtimeConfig: {
    public: {
      apiUrl: ''
    }
  },

  vite: {
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['pdf-parse']
    },
    resolve: {
      alias: {
        buffer: 'buffer'
      }
    }
  },

  nitro: {
    experimental: {
      wasm: true
    }
  },

  imports: {
    dirs: [
      'stores/**'
    ]
  },
  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27'
})