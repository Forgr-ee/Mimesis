<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="flex flex-col justify-center h-screen p-10 bg-secondary">
        <button
          @click="router.push('/')"
          class="absolute top-0 h-8 mt-3 rounded-full md:h-14 md:border md:border-primary safe-mt bg-secondary text-primary w-14 left-3"
        >
          <vue-feather type="arrow-left" class="md:mx-auto"></vue-feather>
        </button>
        <h1 class="my-5 text-5xl font-bold text-center xs:my-10 text-primary">
          {{ $t("themes") }}
        </h1>
        <h3
          v-if="main.offline && main.themes.length > 0"
          class="mx-5 mb-5 font-bold text-center text-1xl text-primary"
        >
          {{ $t("noInternet") }}
        </h3>
        <h3
          v-if="main.offline && main.themes.length === 0"
          class="mx-5 mb-5 font-bold text-center text-1xl text-primary"
        >
          {{ $t("noInternetFirst") }}
        </h3>
        <div class="overflow-x-scroll no_bar md:w-1/2 md:mx-auto">
          <div
            v-for="theme in main.themes"
            :key="theme.id"
            class="flex items-center my-1 border cursor-pointer border-primary bg-light rounded-xl"
            @click="saveTheme(theme.id)"
          >
            <div
              class="relative w-20 h-20 mr-3 xs:w-24 xs:h-24 bg-primary rounded-l-xl"
            >
              <div
                v-if="theme.status === 'paid'"
                class="absolute inset-0 z-20 flex items-center justify-center bg-black text-light bg-opacity-40 rounded-l-xl"
              >
                <vue-feather type="lock"></vue-feather>
              </div>
              <img
                alt="test"
                class="w-full h-full mt-2 fill-current stroke-current text-secondary svg_icon"
                :src="theme.icon"
              />
            </div>
            <p class="xs:text-2xl text-primary">{{theme[$i18n.locale]}}</p>
          </div>
        </div>
        <button
          v-if="isIos('ios')"
          class="px-3 py-1 mx-auto mt-1 text-sm border xs:mt-2 md:w-1/4 bg-light border-primary text-primary rounded-xl"
          @click="restore()"
        >
          {{ $t("restore") }}
        </button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, isPlatform } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useMainStore } from "../store/main";
import { useGameStore } from "../store/game";

export default defineComponent({
  name: "Theme",
  components: {
    IonContent,
    IonPage,
  },
  methods: {
    restore() {
      console.log("restore");
    },
    async saveTheme(theme: string) {
      this.game.theme = theme;
      // this.router.push({path: "/game", hash: "#changeplayer"});
      this.router.push({path: "/game"});
    },
    isIos() {
      return isPlatform("ios");
    },
  },
  async setup() {
    const main = useMainStore();
    const game = useGameStore();
    const router = useRouter();
    return { router, main, game };
  },
});
</script>