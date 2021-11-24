<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar color="secondary">
        <ArrowLeftIcon
          slot="start"
          class="w-1/12 mr-3 text-rose-500"
          @click="router.push('/')"
        />
        <button
          v-if="isIos()"
          slot="end"
          class="
            px-3
            py-1
            mx-auto
            mt-1
            text-sm
            border
            xs:mt-2
            md:w-1/4
            bg-lavender-500
            border-rose-500
            text-rose-500
            rounded-xl
            first-letter:uppercase
          "
          @click="restore()"
        >
          {{ t('restore') }}
        </button>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :scroll-y="false">
      <div class="flex flex-col justify-start h-screen p-10 bg-pizazz-500">
        <h1
          class="
            mb-5
            text-5xl
            font-bold
            text-center
            xs:mb-10
            text-rose-500
            first-letter:uppercase
          "
        >
          {{ t('themes') }}
        </h1>
        <h3
          v-if="main.offline && main.themes.length > 0"
          class="
            mx-5
            mb-5
            font-bold
            text-center text-1xl text-rose-500
            first-letter:uppercase
          "
        >
          {{ t('noInternet') }}
        </h3>
        <h3
          v-if="main.offline && main.themes.length === 0"
          class="
            mx-5
            mb-5
            font-bold
            text-center text-1xl text-rose-500
            first-letter:uppercase
          "
        >
          {{ t('noInternetFirst') }}
        </h3>
        <div class="overflow-x-scroll no_bar md:w-1/2 md:mx-auto">
          <div
            v-for="theme in main.themes"
            :key="theme.id"
            class="
              flex
              items-center
              my-1
              border
              cursor-pointer
              xs:my-3
              md:my-5
              border-rose-500
              bg-lavender-500
              rounded-xl
            "
            @click="saveTheme(theme)"
          >
            <div
              class="
                relative
                w-20
                h-20
                mr-3
                xs:w-24 xs:h-24
                bg-rose-500
                rounded-l-xl
              "
            >
              <div
                v-if="theme.status === 'paid'"
                class="
                  absolute
                  inset-0
                  z-10
                  flex
                  items-center
                  justify-center
                  bg-black
                  text-lavender-500
                  bg-opacity-40
                  rounded-l-xl
                "
              >
                <LockClosedIcon class="w-2/3 text-lavender-500" />
              </div>
              <img
                alt="test"
                class="
                  w-full
                  h-full
                  mt-2
                  fill-current
                  stroke-current
                  text-pizazz-500
                  svg_icon
                "
                :src="theme.icon"
              />
            </div>
            <p class="xs:text-2xl text-rose-500">{{ langName(theme) }}</p>
          </div>
        </div>
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
  import { useMainStore } from '~/store/main'
  import { useGameStore } from '~/store/game'
  import { Theme } from '~/services/firebase'
  import { purchase, restore } from '~/services/iap'
  import PageLoader from '~/components/PageLoader.vue'
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

  const buy = async (theme: Theme) => {
    if (theme.status !== 'paid' || !theme.package) return
    try {
      loading.value = true
      await purchase(theme.package)
      theme.status = 'purchased'
    } catch (e) {
      loading.value = false
      return console.error(e)
    }
  }

  const saveTheme = async (theme: Theme) => {
    if (theme.status === 'paid' && theme.package) {
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
