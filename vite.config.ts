/// <reference types="vitest" />

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import WindiCSS from 'vite-plugin-windicss'
import EnvironmentPlugin from 'vite-plugin-environment'
import pack from './package.json'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    WindiCSS(),
    EnvironmentPlugin(
      {
        VITE_APP_VERSION: pack.version,
        domain: 'mimesis.fun',
        crisp: '1011b75e-c4f6-400c-a6ff-c5077adb9db3',
        FIREBASE_CONFIG: JSON.stringify({
          apiKey: 'AIzaSyA38ipaW0j7sY34I3DiHL3AykwNNJ94aGA',
          authDomain: 'mimesis-ce509.firebaseapp.com',
          databaseURL: 'https://mimesis-ce509-default-rtdb.firebaseio.com',
          projectId: 'mimesis-ce509',
          storageBucket: 'mimesis-ce509.appspot.com',
          messagingSenderId: '647378290909',
          appId: '1:647378290909:web:52e286507b0e9847ecb334',
        }),
      },
      { defineOn: 'import.meta.env' }
    ),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
    deps: {
      inline: ['@vue', '@ionic/core'],
    },
  },
})
