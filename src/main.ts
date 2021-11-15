import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'
// import VueFeather from 'vue-feather';
import { createI18n } from 'vue-i18n'
import { useAuthStore } from './store/auth'
import { useMainStore } from './store/main'
import { initCrisp } from './services/crips'
import pinia from './services/pinia'
import { initCapacitor } from './services/capacitor'
import { initPlausible } from './services/plausible'

import 'virtual:windi.css'
import 'virtual:windi-devtools'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'
import { LangMessages } from './services/firebase'
import { initIap } from './services/iap'

initPlausible()

const app = createApp(App).use(IonicVue).use(pinia())

// app.component(VueFeather.name || 'VueFeather', VueFeather);

const initI18n = async (langsMessages: LangMessages) => {
  try {
    const i18n = createI18n({
      legacy: false,
      globalInjection: false,
      locale: 'fr',
      fallbackLocale: 'fr',
      messages: langsMessages,
    })
    app.use(i18n)
  } catch (err) {
    console.error('initI18n', err)
  }
}

const init = async (isRecall = false) => {
  console.error('init')
  const main = useMainStore()
  const auth = useAuthStore()
  try {
    console.log('authCheck')
    await auth.authCheck()
    console.log('initCrisp')
    initCrisp()
    console.log('main.initialize')
    await main.initialize()
    console.log('initI18n')
    await initI18n(main.langsMessages)
    initIap('lwSBejyKtyLhBghkjWZmsBKKTykuHxfQ')
    // save currentPath
    router.afterEach((to) => {
      const main = useMainStore()
      main.currentPath = to.fullPath
    })
    console.log('use.router')
    app.use(router)
    console.log('router.isReady')
    await router.isReady()
    console.log('mount')
    app.mount('#app')
    console.log('initCapacitor')
    initCapacitor()
  } catch (err) {
    console.error('init', err)
    if (!isRecall) {
      console.error('isRecall')
      await main.initialize(true)
      await init(true)
    }
  }
}
init()
