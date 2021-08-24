<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar color="secondary">
          <ArrowLeftIcon @click="router.push('/')" class="w-1/12 mr-3 text-primary"/>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :scroll-y="false" >
      <div class="flex flex-col justify-start h-screen p-10 bg-secondary">
        <h1 class="mb-5 text-5xl font-bold text-center xs:mb-10 text-primary">
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
            class="flex items-center my-1 border cursor-pointer xs:my-3 md:my-5 border-primary bg-light rounded-xl"
            @click="saveTheme(theme.id)"
          >
            <div
              class="relative w-20 h-20 mr-3 xs:w-24 xs:h-24 bg-primary rounded-l-xl"
            >
              <div
                v-if="theme.status === 'paid'"
                class="absolute inset-0 z-20 flex items-center justify-center bg-black text-light bg-opacity-40 rounded-l-xl"
              >
                <LockClosedIcon/>
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
// import { LockClosedIcon } from '@heroicons/vue/outline'
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/vue/outline'

export default defineComponent({
  name: "Theme",
  components: {
    IonContent,
    IonPage,
    LockClosedIcon,
    ArrowLeftIcon,
  },
  async setup() {
    const main = useMainStore();
    const game = useGameStore();
    const router = useRouter();
    const isIos = () => {
      return isPlatform("ios");
    };
    const saveTheme = async(theme: string) => {
      game.theme = theme;
      router.push({path: "/game"});
    };
    const restore = () => {
      console.log("restore");

    }
    return { router, main, game, isIos, saveTheme, restore };
  },
});
</script>
<style scoped>
ion-toolbar {
  --border-style: none;
}
</style>