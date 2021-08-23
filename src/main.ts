import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import VueFeather from 'vue-feather';
import { createI18n } from 'vue-i18n';
import { useAuthStore } from "./store/auth";
import { useMainStore } from "./store/main";
import { initCrisp } from './services/crips';
import pinia from './services/pinia';
import { initCapacitor } from './services/capacitor';
import { initPlausible } from './services/plausible';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

initPlausible();

const app = createApp(App)
  .use(IonicVue)
  .use(pinia);

app.component(VueFeather.name || 'VueFeather', VueFeather);

const initI18n = async () => {
    const main = useMainStore();
    await main.initialize();
    const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'fr',
    fallbackLocale: 'fr',
    messages: main.langsMessages,
  })
  app.use(i18n);
}
const auth = useAuthStore();

auth.authCheck()
  .then(async () => {
    initCrisp();
    await initI18n();
    // save currentPath
    // router.afterEach((to) => {
    //   const main = useMainStore();
    //   main.currentPath = to.fullPath;
    // });
    app.use(router);
    return router.isReady();
  })
  .then(() => {
    app.mount("#app");
    initCapacitor();
  });
