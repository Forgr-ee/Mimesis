<template>
  <ion-page>
    <ion-content :fullscreen="true">
        <div class="relative flex flex-col justify-between h-screen p-5 pt-10 xs:p-10 bg-secondary">
            <a
                href="/game#backhome"
                @click="pause()"
                class="absolute top-0 h-8 mt-3 rounded-full md:h-14 md:border md:border-primary safe-mt bg-secondary text-primary w-14 left-3"
            >
                <vue-feather type="arrow-left"></vue-feather>
            </a>
            <img class="absolute left-0 right-0 hidden object-contain h-20 m-auto xs:block" src="assets/icon/icon.png" alt="logo" />
            <div id="changeplayer" class="modal">
              <div class="border-2 modal-box bg-secondary border-primary">
                <h2 class="card-title">{{ $t('ready') }}</h2>
                <p class="px-5 mt-4 mb-2 text-xl font-semibold leading-relaxed text-center md:text-2xl">
                    {{team?.team}}
                </p>
                <p class="mb-4 text-xl leading-relaxed xs:px-5 md:text-2xl">
                {{$t('turn_of')}} <strong>{{player?.name}}</strong>
                </p>
                <div class="modal-action">
                  <a href="/home#" class="btn btn-primary">{{ $t("go") }}</a>
                  <a href="/game#" class="btn">{{ $t("resume") }}</a>
                </div>
              </div>
            </div>
            <div id="backhome" class="modal">
              <div class="border-2 modal-box bg-secondary border-primary">
                <h2 class="card-title">{{ $t('beCarefull') }}</h2>
                <p class="py-10 md:text-2xl">{{$t('leave')}}</p>
                <div class="modal-action">
                  <a href="/home#" class="btn btn-primary">{{ $t("backHome") }}</a>
                  <a href="/game#" class="btn">{{ $t("resume") }}</a>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-3 md:pt-10 safe-pt">
                <div>
                    <p class="text-md md:text-xl text-primary">{{$t('team')}}:</p>
                    <h2 class="text-xl font-bold md:text-2xl text-primary">{{team.team}}</h2>
                </div>
                <div>
                    <p class="text-right text-md md:text-xl text-primary">{{$t('player')}}:</p>
                    <h1 class="text-xl font-bold md:text-2xl text-primary">{{player.name}}</h1>
                </div>
            </div>
            <h5 class="my-12 text-5xl font-bold text-center text-primary">{{seconds}}</h5>
            <div id="winner" class="modal">
              <div class="border-2 modal-box bg-secondary border-primary">
                <h2 class="card-title">{{ $t('win') }}</h2>
                <div v-for="(t, index) in winner" :key="index" class="py-2 md:text-3xl">{{$t('win')}} {{t.team}} <strong v-if="index === 0">gagne</strong> <strong v-else>est {{index + 1}} éme avec {{t.score}} !</strong> !</div>)
                <div class="modal-action">
                  <a href="/home#" class="btn btn-primary">{{ $t("backHome") }}</a>
                  <a href="/game#" class="btn">{{ $t("restart") }}</a>
                </div>
              </div>
            </div>
            <div class="h-48">
                <div class="flex flex-col items-center my-auto mb-10 overflow-y-scroll text-3xl border text-primary border-primary bg-light rounded-xl max-h-48">
                    <div class="px-5 py-8 md:p-14">{{mime}}</div>
                </div>
            </div>
            <div class="w-full mb-5">
                <h3 class="text-3xl font-bold text-right md:text-center text-primary">{{$t('score')}}: {{team.score}}</h3>
                <div class="flex justify-between mt-10 text-4xl md:justify-around md:text-5xl text-primary">
                    <button class="px-4 py-2 border-2 md:py-3 md:px-5 bg-light border-primary rounded-xl" @click="skipGuess()">{{$t('pass')}}</button>
                    <button class="px-4 py-2 border-2 md:py-3 md:px-5 bg-light border-primary rounded-xl" @click="validGuess()">{{$t('validate')}}</button>
                </div>
            </div>
            <canvas ref="canvas" class="fixed top-0 left-0 w-screen h-screen pointer-events-none z-60"/>
        </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage, isPlatform } from "@ionic/vue";
import { defineComponent, ref, computed, reactive, watch } from "vue";
import { create as createConfetti } from 'canvas-confetti';
import { useRouter } from "vue-router";
import { App } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';
import {NativeAudio} from '@capacitor-community/native-audio';
import { useStore } from "../hooks/store";
import { Game, getStorage, setStorage, Team } from '@/services/game';
import { useTimer } from 'vue-timer-hook';
import { useAuth } from "../hooks/auth";


const audios: any = {};

if (isPlatform("capacitor")) {
    audios['tada'] = { play: () => {
        NativeAudio.play({
            assetId: "tada",
            time: 0,
        });
    }}
    audios['horn'] = {play: ()=> {
        NativeAudio.play({
            assetId: "horn",
            time: 0,
        });
    }}
    KeepAwake.keepAwake();
} else {
    audios['tada'] = new Audio('assets/icon/tada.mp3');
    audios['horn'] = new Audio('assets/icon/horn.mp3');
}

const makeSound = (name: string) => {
    if (isPlatform("capacitor")) {
        audios[name].play();
    } else {
        audios[name].play();
    }
}

const randomSelect = (filtered: any[]) => {
    return filtered[Math.floor(Math.random() * filtered.length)];
}

const filterListByTitle = (list: any[], past: string[]) => {
    const filtered = list.filter(n => !past.includes(n.title))
    return filtered;
}

const filterListByUUID = (list: any[], past: string[]) => {
    const filtered = list.filter((n) => {
        return past.findIndex((b) => {
            return b === n.uuid;
        }) === -1;
    });
    return filtered;
}

const createTime = () => {
    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 45);
    return expiryTimestamp;
}

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
    this.game = (await getStorage("game", [])) as Game;
    watch(this.isExpired, async (isExpired) => {
        if(isExpired) {
            makeSound("horn");
            await this.nextTeam();
            this.router.push({ name: 'Game', hash: '#changeplayer' });
        }
    });
    this.setupCanvas();
  },
  methods: {
    async nextRound () {
        await this.nextExpression();
        this.restart(createTime());
    },
    async skipGuess  () {
        await this.nextExpression(true);
    },
    async validGuess () {
        await this.nextExpression(false, true);
        await this.addScore();
    },
    async resetScore () {
        this.game.teams.forEach((t) => {
            t.score = 0;
        });
    },
    async addScore () {
        // const teams = await getTeams();
        if (this.team.score < 10) {
            this.team.score += 1;
            for (let index = 0; index < this.team.players.length; index++) {
                if (this.player.uuid === this.game.teams[this.teamIndex].players[index].uuid) {
                    this.game.teams[this.teamIndex].players[index].score += 1;
                }
            }
            if (this.team.score >= 10) {
                this.pause();
                this.winner = this.createLadder();
                makeSound("tada");
                await this.saveGame(this.userData?.id, this.theme, this.$i18n.locale, this.game);
                await this.playConfetti();
            }
        }
    },
    playConfetti () {
        return this.confetti({
            angle: 90,
            spread: 60,
            particleCount: 350,
            ticks: 400
        });
    },
    createLadder (): Team[]  {
        // const teams = await getTeams();
        const sorted = this.game.teams.sort((a, b) => {
            return a.score > b.score ? -1 : 1;
        });
        return sorted
    },
    async nextExpression (skip = false, found = false) {
        // const theme = await getTheme();
        // const lang = await getLangStorage();
        // const guess = await getGuess(theme, lang);
        if (this.game.pastGuess.length === this.guess.length) {
            this.pastGuess = [];
        }
        const result = randomSelect(filterListByTitle(this.guess, this.game.pastGuess));
        this.mime = result.title;
        if (!skip) {
            this.game.pastGuess.push(result.title);
        }
        if (skip) {
            this.game.skipGuess.push(result.title);
        }
        if (found) {
            this.game.foundGuess.push(result.title);
        }
        await setStorage(`guesses_${this.theme}_${this.$i18n.locale}`, this.guess);
    },
    async nextTeam () {
        // const teams = await getTeams();
        let didReset = false;
        if (this.game.pastTeams.length === this.game.teams.length) {
            this.game.pastTeams = [this.team.uuid];
            didReset = true;
        }
        let newTeam: Team;
        if (this.game.mode === 1) {
            newTeam = randomSelect(filterListByUUID(this.game.teams, this.game.pastTeams));
        } else {
            newTeam = filterListByUUID(this.game.teams, this.game.pastTeams).pop();
        }
        newTeam = await this.nextTeamPlayer(newTeam);
        // this.teamIndex = 
        this.team = newTeam;
        if (didReset) {
            this.game.pastTeams = [newTeam.uuid];
        } else {
            this.game.pastTeams.push(newTeam.uuid);
        }
        await setStorage('team', newTeam);
    },
    nextTeamPlayer (team: Team): Team {
        let didReset = false;
        if (team.players.length === team.pastPlayers.length) {
            team.pastPlayers = [this.player.uuid];
            didReset = true;
        }
        let plr = null;
        if (this.game.mode === 1) {
            plr = randomSelect(filterListByUUID(team.players, team.pastPlayers));
        } else {
            plr = filterListByUUID(team.players, team.pastPlayers).pop();
        }
        this.player = plr;
        if (didReset) {
            team.pastPlayers = [plr.uuid];
        } else {
            team.pastPlayers.push(plr.uuid);
        }
        return team;
    },
    setupCanvas () {
      const options = {
        useWorker: true,
        resize: true 
      }
      if (isPlatform("android") && isPlatform("capacitor")) {
        options.resize = false;
      }
      if (this.canvas) {
          this.confetti = createConfetti(this.canvas, options);
      }
    },
    async initGameLoop () {
        this.pause();
        await this.resetScore();
        this.winner = [];
        await this.nextTeam();
        this.router.push({ name: 'Game', hash: '#changeplayer' });
        if (!this.appStateChange) {
            this.appStateChange = App.addListener('appStateChange', (state) => {
                if (!state.isActive) {
                    this.pause();
                } else {
                    this.resume();
                }
            });
        }
    }
  },
  setup() {
    const {
        seconds,
        isExpired,
        pause,
        resume,
        restart,
    } = useTimer({ expiryTimestamp: createTime()});
    const { authCheck, userData } = useAuth();
    const { guess: _guess, theme, lang, reload, saveGame } = useStore();
    const canvas = ref<HTMLCanvasElement>();
    const game = reactive({} as Game);
    const teamIndex = ref(0);
    const playerIndex = ref(0);
    const router = useRouter();
    const team  = computed(() => {
        return game.teams[teamIndex.value];
    });
    const guess  = computed(() => {
        return _guess[`${theme}_${lang}`];
    });
    const player  = computed(() => {
        return game.teams[teamIndex.value].players[playerIndex.value];
    });
    authCheck();
    return {
        userData,
        canvas,
        guess,
        reload,
        teamIndex,
        isExpired,
        router,
        seconds,
        pause,
        restart,
        resume,
        player,
        saveGame,
        team,
        game,
    };
    },
});
</script>
