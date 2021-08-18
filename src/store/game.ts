import { isPlatform } from "@ionic/vue";
import { RateApp } from "capacitor-rate-app";
import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useMainStore } from './main'
import { v4 as uuidv4 } from "uuid";
import FIREBASE_CONFIG from "./.env.firebase";
// import Fakerator from "fakerator";
import faker from 'faker';

// const fakerator = Fakerator("fr-FR");
faker.locale = 'fr';

// initialize firebase, this is directly from the firebase documentation
// regarding getting started for the web
if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

export const randomPlayer = (index: number): Player => ({
  index,
  score: 0,
  name: faker.name.firstName(),
  uuid: uuidv4(),
});

export const randomTeamName = () => faker.commerce.color()

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
    const index = past.findIndex((b) => {
        return b === n.uuid;
      }) === -1;
      return index;
  });
  return filtered;
};

const randomSelect = (filtered: any[]) => {
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const useGameStore = defineStore('game', {
  state: () => ({
      loading: true,
      uuid:  uuidv4(),
      createdAt: new Date().toISOString(),
      mode: 0,
      theme: 'improbable',
      teams: [randomTeam(0), randomTeam(1)] as Team[],
      teamIndex: -1,
      playerIndex: 0,
      pastTeams: [] as string[],
      pastGuess: [] as string[],
      skipGuess: [] as string[],
      foundGuess: [] as string[],
  }),
  getters: {
    ready(): boolean {
      return this.teamIndex !== -1;
    },
    nextTeams(): Team[] {
      return filterListByUUID(this.teams, this.pastTeams) as Team[];
    },
    nextPlayers(): Player[] {
      return filterListByUUID(this.team.players, this.team.pastPlayers) as Player[];
    },
    team(): Team {
      return this.teams[this.teamIndex];
    },
    teamScore(): number {
      try {
        return this.teams[this.teamIndex].score;
      } catch (err) {
        return 0
      }     
    },
    teamName(): string {
      try {
        return this.teams[this.teamIndex].name;
      } catch (err) {
        return ''
      }     
    },
    playerName(): string {
      try {
        return this.teams[this.teamIndex].players[this.playerIndex].name;
      } catch (err) {
        return ''
      }
    },
  },
  actions: {
    nextPlayer(setLoading = true) {
      this.loading = setLoading ? true : this.loading;
      let didReset = false;
      if (this.team.players.length === this.team.pastPlayers.length && this.playerIndex !== -1) {
        this.team.pastPlayers = [this.team.players[this.playerIndex].uuid];
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
      this.loading = setLoading ? false : this.loading;
    },
    addScore() {
      this.team.players[this.playerIndex].score++;
    },
    nextTeam() {
      this.loading = true;
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
      this.teamIndex = newTeam.index;
      if (didReset) {
        this.pastTeams = [newTeam.uuid];
      } else {
        this.pastTeams.push(newTeam.uuid);
      }
      this.nextPlayer(false);
      this.loading = false;
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
      this.teamIndex = -1;
    },
    reset() {
      this.resetScore();
      this.resetHistory();
      this.resetIndex();
    },
    calcMode() {
      const teamLength = this.teams[0].players.length;
      let inequal = false;
      this.teams.forEach((t: Team) => {
          inequal = inequal || teamLength !== t.players.length ? true : false;
      });
      this.mode = inequal ? 1 : 0;
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