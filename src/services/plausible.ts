import { isPlatform } from '@ionic/vue';

declare global {
  interface HTMLScriptElement { 'data-domain': string }
}

export const initPlausible = () => {
    const s = document.createElement("script");
    s.src = "https://plausible.io/js/plausible.js";
    s.async = true;
    s.defer = true;
    s['data-domain'] = "mimesis.fun";
    if (isPlatform("capacitor")) {
      s.src = "https://plausible.io/js/plausible.local.js";
    }
    document.getElementsByTagName("head")[0].appendChild(s);
  };