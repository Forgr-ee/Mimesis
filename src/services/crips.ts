import { isPlatform } from '@ionic/vue';

export const initCrisp = () => {
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