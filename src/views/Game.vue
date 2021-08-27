<template>
  <ion-page>
    <ion-header mode="ios">
      <ion-toolbar color="secondary">
          <ArrowLeftIcon @click="timer.pause(); modals.pause = true" class="w-1/12 pr-3 text-primary"/>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :scroll-y="false">
      <div
        class="relative flex flex-col justify-between h-screen px-5 pb-10 xs:px-10 bg-secondary"
      >
      
        <img
          class="absolute left-0 right-0 hidden object-contain h-20 m-auto xs:block"
          src="/assets/icon/icon.png"
          alt="logo"
        />
        <Modal :open="modals.changePlayer" >
          <template v-slot:icon><CheckIcon class="w-6 h-6 text-green-600" aria-hidden="true" /></template>
          <template v-slot:title>{{ t("ready") }} ?</template>
          <template v-slot:content>
            <p
              class="px-5 mt-4 mb-2 text-xl leading-relaxed text-center md:text-2xl"
            >
              {{ t("team") }} <strong>{{ game.teamName }}</strong>
            </p>
            <p class="mb-4 text-xl leading-relaxed xs:px-5 md:text-2xl">
              {{ t("turnOf") }} <strong>{{ game.playerName }}</strong>
            </p>
          </template>
          <template v-slot:buttons>
              <button type="button" @click="nextRound(); modals.changePlayer=false" 
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none">
                {{ t("go") }}
              </button>
          </template>
        </Modal>
        <Modal :open="modals.pause" >
          <template v-slot:icon><ExclamationIcon class="w-6 h-6 text-red-600" aria-hidden="true" /></template>
          <template v-slot:title>{{ t("beCarefull") }}</template>
          <template v-slot:content><p class="py-10 md:text-2xl">{{ t("leave") }}</p></template>
          <template v-slot:buttons>
              <router-link to="/home" @click="modals.pause=false" class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-light text-primary border-primary md:text-base hover:shadow-lg focus:outline-none">{{ t("backHome") }}</router-link>
              <button type="button" @click="timer.resume(); modals.pause=false" 
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none">
                {{ t("resume") }}
              </button>
          </template>
        </Modal>
        <Modal :open="modals.winner" >
          <template v-slot:icon><CheckIcon class="w-6 h-6 text-red-600" aria-hidden="true" /></template>
          <template v-slot:title>{{ t("gameWin") }}</template>
          <template v-slot:content>
            <div
              v-for="(w, index) in game.ladder"
              :key="index"
              class="py-2 md:text-3xl capitalize-first"
            >
              {{ t("team") }} {{ w.name }}
              <strong v-if="index === 0">{{ t("win") }}</strong>
              <strong v-else
                >{{ t("is") }} {{ index + 1 }} {{ t("rankWith") }} {{ w.score }} !</strong
              >
              !
            </div>
          </template>
          <template v-slot:buttons>
              <router-link to="/home" @click="modals.winner=false" class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-light text-primary border-primary md:text-base hover:shadow-lg focus:outline-none">{{ t("backHome") }}</router-link>
              <button type="button" @click="initGameLoop()" 
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none">
                {{ t("restart") }}
              </button>
          </template>
        </Modal>
        <div class="flex items-center justify-between pt-3 md:pt-10 safe-pt">
          <div>
            <p class="text-md md:text-xl text-primary">{{ t("team") }} :</p>
            <h2 class="text-xl font-bold md:text-2xl text-primary">
              {{ game.teamName }}
            </h2>
          </div>
          <div>
            <p class="text-right text-md md:text-xl text-primary">
              {{ t("player") }} :
            </p>
            <h1 class="text-xl font-bold md:text-2xl text-primary">
              {{ game.playerName }}
            </h1>
          </div>
        </div>
        <h5 class="my-12 text-5xl font-bold text-center text-primary">
          {{ timer.seconds }}
        </h5>
        <div class="h-48">
          <div
            class="flex flex-col items-center my-auto mb-10 overflow-y-scroll text-3xl border text-primary border-primary bg-light rounded-xl max-h-48"
          >
            <div class="px-5 py-8 md:p-14">{{ main.guess }}</div>
          </div>
        </div>
        <div class="w-full mb-5">
          <h3 class="text-3xl font-bold text-right md:text-center text-primary">
            {{ t("score") }}: {{ game.teamScore }}
          </h3>
          <div
            class="flex justify-between mt-10 text-4xl md:justify-around md:text-5xl text-primary"
          >
            <a
              class="px-4 py-2 border-2 md:py-3 md:px-5 bg-light border-primary rounded-xl"
              @click="skipGuess()"
            >
              {{ t("pass") }}
            </a>
            <a
              class="px-4 py-2 border-2 md:py-3 md:px-5 bg-light border-primary rounded-xl"
              @click="validGuess()"
            >
              {{ t("validate") }}
            </a>
          </div>
        </div>
      </div>
    </ion-content> 
  </ion-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { IonContent, IonPage, isPlatform, IonToolbar, IonHeader } from "@ionic/vue";
import { onMounted, reactive, ref, watchEffect } from "vue";
import { create as createConfetti } from "canvas-confetti";
import { App } from "@capacitor/app";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { NativeAudio } from "@capacitor-community/native-audio";
import { useTimer } from "vue-timer-hook";
import { useMainStore } from "../store/main";
import { useGameStore } from "../store/game";
import Modal from "../components/Modal.vue";
import { CheckIcon, ExclamationIcon, ArrowLeftIcon } from '@heroicons/vue/outline'

const audios: any = {};

const { t } = useI18n();

if (isPlatform("capacitor")) {
  audios["tada"] = {
    play: () => {
      NativeAudio.play({
        assetId: "tada",
        time: 0,
      });
    },
  };
  audios["horn"] = {
    play: () => {
      NativeAudio.play({
        assetId: "horn",
        time: 0,
      });
    },
  };
  KeepAwake.keepAwake();
} else {
  audios["tada"] = new Audio("assets/tada.mp3");
  audios["horn"] = new Audio("assets/horn.mp3");
}

const makeSound = (name: string) => {
  if (isPlatform("capacitor")) {
    audios[name].play();
  } else {
    audios[name].play();
  }
};

const appStateChange = ref();
const modals = reactive({
  changePlayer: true,
  winner: false,
  pause: false,
});
const game = useGameStore();
const main = useMainStore();
const timer = useTimer(1, false);
let confetti: confetti.CreateTypes;

const createTime = () => {
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 45);
  return expiryTimestamp.getTime();
};

const skipGuess = () => {
  main.nextGuess();
};

const nextRound = () => {
  skipGuess();
  timer.restart(createTime());
};

const playConfetti = () => {
  return confetti({
    angle: 90,
    spread: 60,
    particleCount: 350,
    ticks: 400,
  });
};

const validGuess = () => {
  main.nextGuess(true);
  game.addScore();
};

const setupCanvas = () => {
  const options = {
    useWorker: true,
    resize: true,
  };
  if (isPlatform("android") && isPlatform("capacitor")) {
    options.resize = false;
  }
  confetti = createConfetti(null as unknown as HTMLCanvasElement, options);
};

const initGameLoop = () => {
  game.reset();
  main.nextGuess();
  game.nextTeam();
  modals.changePlayer = true;
  modals.winner = false;
}

onMounted(() => {
  watchEffect(async () => {
    if(timer.isExpired.value) {
        makeSound("horn");
        await game.nextTeam();
        modals.changePlayer = true;
    }
  })
  watchEffect(async () => {
    if (game.winned) {
      playConfetti(); // don't await this 
      timer.pause();
      modals.winner = true;
      makeSound("tada");
      await game.save();
    }
  })
  appStateChange.value = App.addListener("appStateChange", (state) => {
    if (!state.isActive) {
      timer.pause();
    } else {
      timer.resume();
    }
  });
  setupCanvas();
});
</script>
<style scoped>
ion-toolbar {
  --border-style: none;
}
</style>