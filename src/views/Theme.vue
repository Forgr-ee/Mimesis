<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar color="secondary">
        <ArrowLeftIcon
          class="w-1/12 mr-3 text-primary"
          @click="router.push('/')"
        />
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :scroll-y="false">
      <div class="flex flex-col justify-start h-screen p-10 bg-secondary">
        <h1 class="mb-5 text-5xl font-bold text-center xs:mb-10 text-primary">
          {{ t('themes') }}
        </h1>
        <h3
          v-if="main.offline && main.themes.length > 0"
          class="mx-5 mb-5 font-bold text-center text-1xl text-primary"
        >
          {{ t('noInternet') }}
        </h3>
        <h3
          v-if="main.offline && main.themes.length === 0"
          class="mx-5 mb-5 font-bold text-center text-1xl text-primary"
        >
          {{ t('noInternetFirst') }}
        </h3>
        <div class="overflow-x-scroll no_bar md:w-1/2 md:mx-auto">
          <div
            v-for="theme in main.themes"
            :key="theme.id"
            class="flex items-center my-1 border cursor-pointer xs:my-3 md:my-5 border-primary bg-light rounded-xl"
            @click="saveTheme(theme)"
          >
            <div
              class="relative w-20 h-20 mr-3 xs:w-24 xs:h-24 bg-primary rounded-l-xl"
            >
              <div
                v-if="theme.status === 'paid'"
                class="absolute inset-0 z-10 flex items-center justify-center bg-black text-light bg-opacity-40 rounded-l-xl"
              >
                <LockClosedIcon class="w-2/3 text-light"/>
              </div>
              <img
                alt="test"
                class="w-full h-full mt-2 fill-current stroke-current text-secondary svg_icon"
                :src="theme.icon"
              />
            </div>
            <p class="xs:text-2xl text-primary">{{ langName(theme) }}</p>
          </div>
        </div>
        <button
          v-if="isIos()"
          class="px-3 py-1 mx-auto mt-1 text-sm border xs:mt-2 md:w-1/4 bg-light border-primary text-primary rounded-xl"
          @click="restore()"
        >
          {{ t('restore') }}
        </button>
      </div>
      <PageLoader :show="loading" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  IonContent,
  IonPage,
  isPlatform,
  IonToolbar,
  IonHeader,
} from '@ionic/vue'
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/vue/outline'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/store/main'
import { useGameStore } from '@/store/game'
import { Theme } from '@/services/firebase'
import { purchase, listenBuy, listenCancel } from '@/services/iap'
import PageLoader from '@/components/PageLoader.vue'
import { ref } from 'vue'

const { t, locale } = useI18n()
const main = useMainStore()
const game = useGameStore()
const router = useRouter()
const loading = ref(false)

const isIos = () => {
  return isPlatform('ios')
}

const langName = (theme: Theme): string => {
  return (theme as never)[locale.value]
}

const restore = async () => {
  await main.initThemes()
}

const buy = async (theme: Theme) => {
  if (theme.status !== 'paid' || !theme.product) return
  try {
    loading.value = true
    await purchase(theme.product)
    listenCancel(theme.product).then(() => {
      loading.value = false
    })
    listenBuy(theme.product).then(() => {
      theme.status = 'purchased'
      loading.value = false
    })
  } catch (e) {
    loading.value = false
    return console.error(e)
  }
}

const saveTheme = async (theme: Theme) => {
  if (theme.status === 'paid' && theme.product) {  
    return buy(theme)
  }
  game.theme = theme.id
  game.reset()
  main.nextGuess()
  game.nextTeam()
  router.push({ path: '/game' })
}
</script>
<style scoped>
  ion-toolbar {
    --border-style: none;
  }
</style>
