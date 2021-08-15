import { isPlatform } from "@ionic/vue";
import { RateApp } from "capacitor-rate-app";
import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useMainStore } from './main'
import { v4 as uuidv4 } from "uuid";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import FIREBASE_CONFIG from "./.env.firebase";

// initialize firebase, this is directly from the firebase documentation
// regarding getting started for the web
if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

export const randomName = () =>
  uniqueNamesGenerator({
    dictionaries: [animals],
    separator: " ",
  });

  export const randomPlayer = (index: number): Player => ({
  index,
  score: 0,
  name: randomName(),
  uuid: uuidv4(),
});

export const randomTeamName = () =>
  uniqueNamesGenerator({
    dictionaries: [colors],
    separator: " ",
  });

export interface Player {
  index: number;
  uuid: string;
  score: number;
  name: string;
}

export interface Team {
  index: number;
  uuid: string;
  score: number;
  name: string;
  players: Player[];
  pastPlayers: string[];
}

export const randomTeam = (index: number): Team => ({
  index,
  uuid: uuidv4(),
  name: randomTeamName(),
  players: [randomPlayer(0), randomPlayer(1)],
  pastPlayers: [],
  score: 0,
});

export type Theme = {
    active: boolean;
    lang: {
    [key: string]: string;
    };
    icon: string;
    id: string;
    order: number;
    status: string;
};

export type GuessDb = {
    [key: string]: Guess[];
};

export type Guess = {
    title: string;
};

const filterListByUUID = (list: any[], past: string[]) => {
  const filtered = list.filter((n) => {
    return (
      past.findIndex((b) => {
        return b === n.uuid;
      }) === -1
    );
  });
  return filtered;
};

const randomSelect = (filtered: any[]) => {
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const useGameStore = defineStore('game', {
  state: () => ({
      uuid:  uuidv4(),
      createdAt: new Date().toISOString(),
      mode: 0,
      theme: '',
      teams: [randomTeam(0), randomTeam(1)] as Team[],
      teamIndex: 0,
      playerIndex: 0,
      pastTeams: [] as string[],
      pastGuess: [] as string[],
      skipGuess: [] as string[],
      foundGuess: [] as string[],
  }),
  getters: {
    nextTeams(): Team[] {
      return filterListByUUID(this.teams, this.pastTeams) as Team[];
    },
    nextPlayers(): Player[] {
      return filterListByUUID(this.team.players, this.team.pastPlayers) as Player[];
    },
    team(): Team {
      return this.teams[this.teamIndex];
    },
    player(): Player {
      return this.team.players[this.playerIndex];
    },
  },
  actions: {
    nextPlayer() {
      let didReset = false;
      if (this.team.players.length === this.team.pastPlayers.length) {
        this.team.pastPlayers = [this.player.uuid];
        didReset = true;
      }
      let plr = null;
      if (this.mode === 1) {
        plr = randomSelect(this.nextPlayers) as Player;
      } else {
        plr = this.nextPlayers.pop() as Player;
      }
      this.playerIndex = plr.index;
      if (didReset) {
        this.team.pastPlayers = [plr.uuid];
      } else {
        this.team.pastPlayers.push(plr.uuid);
      }
    },
    nextTeam() {
      let didReset = false;
      if (this.pastTeams.length === this.teams.length) {
        this.pastTeams = [this.team.uuid];
        didReset = true;
      }
      let newTeam: Team;
      if (this.mode === 1) {
        newTeam = randomSelect(this.nextTeams) as Team;
      } else {
        newTeam = this.nextTeams.pop() as Team;
      }
      this.nextPlayer();
      this.teamIndex = newTeam.index;
      if (didReset) {
        this.pastTeams = [newTeam.uuid];
      } else {
        this.pastTeams.push(newTeam.uuid);
      }
    },
    resetScore() {
      this.teams.forEach((t: Team) => {
        t.score = 0;
      });
    },
    resetHistory() {
      this.teams.forEach((t: Team) => {
        t.pastPlayers = [];
      });
      this.pastGuess = [];
      this.pastTeams = [];
      this.skipGuess = [];
      this.foundGuess = [];
    },
    resetIndex() {
      this.playerIndex = 0;
      this.teamIndex = 0;
    },
    reset() {
      this.resetScore();
      this.resetHistory();
      this.resetIndex();
    },
    calcMode() {
      let teamLength = -1;
      this.teams.forEach((t: Team) => {
        if (teamLength === -1) {
          teamLength = t.players.length;
        }
        if (teamLength !== t.players.length) {
          this.mode = 1;
        }
      });
    },
    async save() {
      const authStore = useAuthStore()
      const mainStore = useMainStore()
      if (!authStore.initialized) {
        await authStore.authCheck();
      }
      const refGames = firebase.firestore().collection(`users/${authStore?.user?.uid}/games`);
      const refUser = firebase.firestore().collection(`users`).doc(authStore?.user?.uid);
      await refGames.add({lang: mainStore.lang, ...this.$state});
      const gamesRef = await refGames.get();
      const games = gamesRef.docs.length;
      if (isPlatform("capacitor") && games > 2) {
          RateApp.requestReview();
      }
      await refUser.set({
          games,
      });
    }
  }
})