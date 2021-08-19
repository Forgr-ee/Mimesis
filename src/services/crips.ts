import { isPlatform } from '@ionic/vue';

declare global {
    interface Window { $crisp: any[]; CRISP_WEBSITE_ID: string }
}

export const initCrisp = () => {
  try {
    if (isPlatform("capacitor")) {
      window.$crisp = [
        ["safe", true],
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
  } catch (e) {
    console.error('Plausible cannot be init', e);
  }
};