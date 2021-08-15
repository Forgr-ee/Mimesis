<template>
  <ion-page>
     <ion-content :fullscreen="true">
     <div
        class="relative flex flex-col justify-between h-screen p-5 pt-10 xs:p-10 bg-secondary"
      >
        <a
          href="/game#backhome"
          @click="pause()"
          class="absolute top-0 h-8 mt-3 rounded-full md:h-14 md:border md:border-primary safe-mt bg-secondary text-primary w-14 left-3"
        >
          <vue-feather type="arrow-left"></vue-feather>
        </a>
        <img
          class="absolute left-0 right-0 hidden object-contain h-20 m-auto xs:block"
          src="assets/icon/icon.png"
          alt="logo"
        />
        <div id="changeplayer" class="modal">
          <div class="border-2 modal-box bg-secondary border-primary">
            <h2 class="card-title">{{ $t("ready") }}</h2>
            <p
              class="px-5 mt-4 mb-2 text-xl font-semibold leading-relaxed text-center md:text-2xl"
            >
              {{ game.team.name }}
            </p>
            <p class="mb-4 text-xl leading-relaxed xs:px-5 md:text-2xl">
              {{ $t("turn_of") }} <strong>{{ game.player.name }}</strong>
            </p>
            <div class="modal-action">
              <a href="/home#" class="btn btn-primary">{{ $t("go") }}</a>
              <a href="/game#" class="btn">{{ $t("resume") }}</a>
            </div>
          </div>
        </div>
        <div id="backhome" class="modal">
          <div class="border-2 modal-box bg-secondary border-primary">
            <h2 class="card-title">{{ $t("beCarefull") }}</h2>
            <p class="py-10 md:text-2xl">{{ $t("leave") }}</p>
            <div class="modal-action">
              <a href="/home#" class="btn btn-primary">{{ $t("backHome") }}</a>
              <a href="/game#" class="btn">{{ $t("resume") }}</a>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pt-3 md:pt-10 safe-pt">
          <div>
            <p class="text-md md:text-xl text-primary">{{ $t("team") }} :</p>
            <h2 class="text-xl font-bold md:text-2xl text-primary">
              {{ game.team.name }}
            </h2>
          </div>
          <div>
            <p class="text-right text-md md:text-xl text-primary">
              {{ $t("player") }} :
            </p>
            <h1 class="text-xl font-bold md:text-2xl text-primary">
              {{ game.player.name }}
            </h1>
          </div>
        </div>
        <h5 class="my-12 text-5xl font-bold text-center text-primary">
          {{ seconds }}
        </h5>
        <div id="winner" class="modal">
          <div class="border-2 modal-box bg-secondary border-primary">
            <h2 class="card-title">{{ $t("win") }}</h2>
            <div
              v-for="(t, index) in winner"
              :key="index"
              class="py-2 md:text-3xl"
            >
              {{ $t("win") }} {{ t.name }}
              <strong v-if="index === 0">gagne</strong>
              <strong v-else
                >est {{ index + 1 }} éme avec {{ t.score }} !</strong
              >
              !
            </div>
            <div class="modal-action">
              <a href="/home#" class="btn btn-primary">{{ $t("backHome") }}</a>
              <a href="/game#" class="btn">{{ $t("restart") }}</a>
            </div>
          </div>
        </div>
        <div class="h-48">
          <div
            class="flex flex-col items-center my-auto mb-10 overflow-y-scroll text-3xl border text-primary border-primary bg-light rounded-xl max-h-48"
          >
            <div class="px-5 py-8 md:p-14">{{ mime }}</div>
          </div>
        </div>
        <div class="w-full mb-5">
          <h3 class="text-3xl font-bold text-right md:text-center text-primary">
            {{ $t("score") }}: {{ game.team.score }}
          </h3>
          <div
            class="flex justify-between mt-10 text-4xl md:justify-around md:text-5xl text-primary"
          >
            <button
              class="px-4 py-2 border-2 md:py-3 md:px-5 bg-light border-primary rounded-xl"
              @click="skipGuess()"
            >
              {{ $t("pass") }}
            </button>
            <button
              class="px-4 py-2 border-2 md:py-3 md:px-5 bg-light border-primary rounded-xl"
              @click="validGuess()"
            >
              {{ $t("validate") }}
            </button>
          </div>
        </div>
        <canvas
          ref="canvas"
          class="fixed top-0 left-0 w-screen h-screen pointer-events-none z-60"
        />
      </div>
    </ion-content> 
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, isPlatform } from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { create as createConfetti } from "canvas-confetti";
import { useRouter } from "vue-router";
import { App } from "@capacitor/app";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { NativeAudio } from "@capacitor-community/native-audio";
import { useTimer } from "vue-timer-hook";
import { useMainStore } from "../store/main";
import { Team, useGameStore } from "../store/game";

const audios: any = {};

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
  audios["tada"] = new Audio("assets/icon/tada.mp3");
  audios["horn"] = new Audio("assets/icon/horn.mp3");
}

const makeSound = (name: string) => {
  if (isPlatform("capacitor")) {
    audios[name].play();
  } else {
    audios[name].play();
  }
};

const createTime = () => {
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 45);
  return expiryTimestamp.getTime();
};

export default defineComponent({
  name: "Game",
  components: {
    IonContent,
    IonPage,
  },
  data() {
    return {
      appStateChange: null as any,
      confetti: null as any,
      theme: "",
      mime: "",
      pastGuess: [] as string[],
      winner: [] as Team[],
    };
  },
  async mounted() {
    console.log(
      // this.router,
      // this.canvas,
      'guess', this.main.guess, //undefined
      // this.reload,
      // this.teamIndex,
      // this.isExpired,
      // this.seconds,
      // this.pause,
      // this.restart,
      // this.resume,
      // this.player,
      // this.saveGame,
      // this.team,
      // this.game
      );
    // watch(this.isExpired, async (isExpired) => {
    //     if(isExpired) {
    //         makeSound("horn");
    //         await this.nextTeam();
    //         this.router.push({ name: 'Game', hash: '#changeplayer' });
    //     }
    // });
    this.setupCanvas();
    await this.initGameLoop();
  },
  methods: {
    async nextRound() {
      await this.main.nextGuess();
      this.restart(createTime(), true);
    },
    async skipGuess() {
      await this.main.nextGuess(true);
    },
    async validGuess() {
      await this.main.nextGuess(false, true);
      await this.addScore();
    },
    async addScore() {
      if (this.game.team.score < 10) {
        this.game.team.score += 1;
        this.game.player.score += 1;
        if (this.game.team.score >= 10) {
          this.pause();
          this.winner = this.createLadder();
          makeSound("tada");
          await this.game.save();
          await this.playConfetti();
        }
      }
    },
    playConfetti() {
      return this.confetti({
        angle: 90,
        spread: 60,
        particleCount: 350,
        ticks: 400,
      });
    },
    createLadder(): Team[] {
      // const teams = await getTeams();
      const sorted = this.game.teams.sort((a: Team, b: Team) => {
        return a.score > b.score ? -1 : 1;
      });
      return sorted;
    },
    setupCanvas() {
      const options = {
        useWorker: true,
        resize: true,
      };
      if (isPlatform("android") && isPlatform("capacitor")) {
        options.resize = false;
      }
      if (this.canvas) {
        this.confetti = createConfetti(this.canvas, options);
      }
    },
    async initGameLoop() {
      this.pause();
      await this.game.resetScore();
      this.winner = [];
      this.main.nextGuess();
      await this.game.nextTeam();
      this.router.push({ name: "Game", hash: "#changeplayer" });
      if (!this.appStateChange) {
        this.appStateChange = App.addListener("appStateChange", (state) => {
          if (!state.isActive) {
            this.pause();
          } else {
            this.resume();
          }
        });
      }
    },
  },
  async setup() {
    const router = useRouter();
    const game = useGameStore();
    const main = useMainStore();
    console.log('useTimer', useTimer);
    // fake timer
    const seconds = 0;
    const isExpired = false;
    const pause = () => {console.log('pause')};
    const resume = () => {console.log('resume')};
    const restart = (expiry: number, autoStart?: boolean | undefined) => {console.log('restart', expiry, autoStart)};
    // fake timer
    
    // const { seconds, isExpired, pause, resume, restart } = useTimer(
    //     createTime()
    // );
    const canvas = ref<HTMLCanvasElement>();
    return {
      router,
      canvas,
      main,
      isExpired,
      seconds,
      pause,
      restart,
      resume,
      game,
    };
  },
});
</script>
