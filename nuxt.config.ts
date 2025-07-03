// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui', // UInputやUButtonを使うためのUIモジュール
    '@nuxtjs/tailwindcss' // Tailwind CSSを有効にするためのモジュール
  ],
  // グローバルCSSファイルを指定（Tailwindのベーススタイルを読み込むため）
  css: [
    '~/assets/css/main.css'
  ]
})