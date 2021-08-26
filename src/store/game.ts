import { isPlatform } from "@ionic/vue";
import { RateApp } from "capacitor-rate-app";
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useMainStore } from './main'
import { v4 as uuidv4 } from "uuid";
import faker from 'faker';

faker.locale = 'fr';

import { addDoc, collection, getFirestore, getDocs, setDoc, doc } from "firebase/firestore"; 
import { firebaseApp } from '../services/firebase';

const db = getFirestore(firebaseApp);

export const randomPlayer = (): Player => ({
  score: 0,
  name: faker.name.firstName(),
  uuid: uuidv4(),
});

export const randomTeamName = () => faker.commerce.color()

export interface Player {
  // index: number;
  uuid: string;
  score: number;
  name: string;
}

export interface Team {
  // index: number;
  uuid: string;
  score: number;
  name: string;
  players: Player[];
  pastPlayers: string[];
}

export const randomTeam = (): Team => ({
  uuid: uuidv4(),
  name: randomTeamName(),
  players: [randomPlayer(), randomPlayer()],
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

// function find by uuid in array
const findByUUID = (list: any[], uuid: string) => {
  return list.find(item => item.uuid === uuid);
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
      winned: false,
      loading: true,
      uuid:  uuidv4(),
      createdAt: new Date().toISOString(),
      theme: 'improbable',
      teams: [randomTeam(), randomTeam()] as Team[],
      teamUUID: "-1",
      playerUUID: "-1",
      pastTeams: [] as string[],
      skipGuess: [] as string[],
      foundGuess: [] as string[],
  }),
  getters: {
    ready(): boolean {
      return this.teamUUID !== "-1";
    },
    nextTeams(): Team[] {
      return filterListByUUID(this.teams, this.pastTeams) as Team[];
    },
    ladder(): Team[] {
      const sorted = this.teams.sort((a: Team, b: Team) => {
        return a.score > b.score ? -1 : 1;
      });
      return sorted;
    },
    nextPlayers(): Player[] {
      return filterListByUUID(this.team.players, this.team.pastPlayers) as Player[];
    },
    team(): Team {
      return findByUUID(this.teams, this.teamUUID);
    },
    player(): Player {
      return findByUUID(this.team.players, this.playerUUID);
    },
    pastGuess(): string[] {
      return [...this.skipGuess, ...this.foundGuess];
    },
    teamScore(): number {
      try {
        return this.team.score;
      } catch (err) {
        return 0
      }     
    },
    teamName(): string {
      try {
        return this.team.name;
      } catch (err) {
        return ''
      }     
    },
    mode() {
      const teamLength = this.teams[0].players.length;
      let inequal = false;
      this.teams.forEach((t: Team) => {
          inequal = inequal || teamLength !== t.players.length ? true : false;
      });
      return inequal ? 1 : 0;
    },
    playerName(): string {
      try {
        return this.player.name;
      } catch (err) {
        return ''
      }
    },
  },
  actions: {
    nextPlayer(setLoading = true) {
      this.loading = setLoading ? true : this.loading;
      let didReset = false;
      if (this.team && this.team.players.length === this.team.pastPlayers.length) {
        this.team.pastPlayers = [this.player.uuid];
        didReset = true;
      }
      let plr = null;
      if (this.mode === 1) {
        plr = randomSelect(this.nextPlayers) as Player;
      } else {
        plr = this.nextPlayers.pop() as Player;
      }
      this.playerUUID = plr.uuid;
      if (didReset) {
        this.team.pastPlayers = [plr.uuid];
      } else {
        this.team.pastPlayers.push(plr.uuid);
      }
      this.loading = setLoading ? false : this.loading;
    },
    addScore() {
      if (this.team.score < 10) {
        this.team.score += 1
        this.player.score++
        if (this.team.score >= 10) {
          this.winned = true
        }
      }
    },
    nextTeam() {
      this.loading = true;
      if (this.teamUUID !== "-1") {
        this.pastTeams.push(this.teamUUID);
      }
      if (this.pastTeams.length === this.teams.length) {
        this.pastTeams = [this.teamUUID];
      }
      let newTeam: Team;
      if (this.mode === 1) {
        newTeam = randomSelect(this.nextTeams) as Team;
      } else {
        newTeam = this.nextTeams.pop() as Team;
      }
      this.teamUUID = newTeam.uuid;
      this.nextPlayer(false);
      this.loading = false;
    },
    resetScore() {
      this.teams.forEach((t: Team) => {
        t.score = 0;
      });
      this.winned = false;
    },
    resetHistory() {
      this.teams.forEach((t: Team) => {
        t.pastPlayers = [];
      });
      this.pastTeams = [];
      this.skipGuess = [];
      this.foundGuess = [];
    },
    resetIndex() {
      this.playerUUID = "-1";
      this.teamUUID = "-1";
    },
    reset() {
      this.resetScore();
      this.resetHistory();
      this.resetIndex();
    },
    async save() {
      const authStore = useAuthStore()
      const mainStore = useMainStore()
      if (!authStore.initialized) {
        await authStore.authCheck();
      }
      try {
        
        const colGames = await collection(db, `users/${authStore?.user?.uid}/games`)
        const refUser = doc(db, 'users', authStore?.user?.uid as string);
        await addDoc(colGames, {lang: mainStore.lang, ...this.$state, doneAt: new Date().toISOString()});
        const querySnapshot = await getDocs(colGames)
        const games = querySnapshot.docs.length;
        if (isPlatform("capacitor") && games > 2) {
          RateApp.requestReview();
        }
        await setDoc(refUser, {games})
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  }
})