import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import VueFeather from 'vue-feather';
import { createI18n } from 'vue-i18n';

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
import { useAuth } from "./hooks/auth";
import { useStore } from "./hooks/store";
import { isPlatform } from '@ionic/vue';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import {NativeAudio} from '@capacitor-community/native-audio';

const { authCheck } = useAuth();
const app = createApp(App)
  .use(IonicVue);
app.component(VueFeather.name, VueFeather);

const initCrisp = () => {
  if (isPlatform("capacitor")) {
    window.$crisp = [
      ["do", "chat:hide"],
      [
        "on",
        "chat:closed",
        () => {
          window.$crisp.push(["do", "chat:hide"]);
        },
      ],
      [
        "on",
        "message:received",
        () => {
          window.$crisp.push(["do", "chat:show"]);
        },
      ],
    ];
  } else {
    window.$crisp = [];
  }
  window.CRISP_WEBSITE_ID = "1f5d5a70-2622-4536-a454-996394feeaad";
  const s = document.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = true;
  document.getElementsByTagName("head")[0].appendChild(s);
};

const initApp = () => {
  if (isPlatform("capacitor")) {
    StatusBar.hide();
    NativeAudio.preload({
      assetPath: "tada.mp3",
      assetId: "tada",
      audioChannelNum: 1,
      isUrl: false,
    });
    NativeAudio.preload({
        assetPath: "horn.mp3",
        assetId: "horn",
        audioChannelNum: 1,
        isUrl: false,
    });
    SplashScreen.hide();
  }
};

const initI18n = async () => {
    const { langsMessages, reload } = useStore();
    await reload();
    const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'fr',
    fallbackLocale: 'fr',
    messages: langsMessages.value,
  })
  app.use(i18n);
}

authCheck()
  .then(async () => {
    initCrisp();
    await initI18n();
    app.use(router);
    return router.isReady();
  })
  .then(() => {
    app.mount("#app");
    initApp();
  });

declare global {
  interface Window { $crisp: any[]; CRISP_WEBSITE_ID: string }
}