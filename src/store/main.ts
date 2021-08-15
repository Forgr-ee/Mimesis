import { randomSelect } from '@/services/random';
import firebase from "firebase/app";
// Required for side-effects
import "firebase/firestore";
import { defineStore } from 'pinia'

import FIREBASE_CONFIG from "./.env.firebase";
import { useGameStore } from './game';

// initialize firebase, this is directly from the firebase documentation
// regarding getting started for the web
if (firebase.apps.length === 0) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

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

type Message = {
  [key: string]: string;
}

type LangMessage = Message & {
  id: string;
  active: boolean;
}


type LangMessages = {
  [key: string]: LangMessage;
}

const filterListByTitle = (list: Guess[], past: string[]) => {
  const filtered = list.filter((n) => !past.includes(n.title));
  return filtered;
};

export const useMainStore = defineStore('main', {
  // other options...
  state: () => ({
      error: false,
      loading: false,
      lastUpdate: '',
      initialized: false,
      currentPath: '/home',
      themes: [] as Theme[],
      offline: false,
      langsMessages: {} as LangMessages,
      lang: 'fr',
      guessDb: {} as GuessDb,
      guess: '',

  }),
  getters: {
    langs(): string[] {
      return Object.keys(this.langsMessages).map((key) => {
        const lang = this.langsMessages[key];
        return lang.id;
      });
    },
    guesses(): Guess[] {
      const game = useGameStore();
      console.log('`${game.theme}_${this.lang}`', `${game.theme}_${this.lang}`);
      return this.guessDb[`${game.theme}_${this.lang}`];
    },
    needUpdate(): boolean {
      const lastUpdate = new Date(this.lastUpdate);
      const today = new Date();
      return lastUpdate.getDate() !== today.getDate() &&
        lastUpdate.getMonth() !== today.getMonth() &&
        lastUpdate.getFullYear() !== today.getFullYear()
    }
  },
  actions: {
    async initialize() {
      this.offline = !window.navigator.onLine;
      if (this.offline || this.initialized || !this.needUpdate) return;
      this.loading = true;
      try {
        await Promise.all([this.initLangMessages(), this.initThemes()]);
        this.initialized = true;
      } catch (err) {
        this.error = err;
        console.log('err initialise', err);
      }
      this.lastUpdate = new Date().toISOString();
      this.loading = false;
    },
    async initGuessCategory(category: string) {
      const value: Guess[] = [];
      try {
        const snapshot = await firebase.firestore().collection(`mode/${category}/${this.lang}`).get();
        snapshot.docs.map(doc => {
            const data = doc.data() as Guess;
            value.push(data);
        });
      } catch (err) {
        console.error('initGuessCategory', category, err);
        throw new Error(err);
      }
      this.guessDb[`${category}_${this.lang}`] = value;
    },
    async initThemes() {
      const value: Theme[] = [];
      const listProm: Promise<void>[] = [];
      try {
        const snapshot = await firebase.firestore()
          .collection('mode')
          .where('active', '==', true)
          .orderBy('order', 'desc').get();
        snapshot.docs.map(doc => {
            const theme = doc.data() as Theme;
            value.push(theme);
            listProm.push(this.initGuessCategory(theme.id));
        });
        await Promise.all(listProm);
      } catch (err) {
        console.error('initThemes', err);
        throw new Error(err);
      }
      this.themes = value;
    },
    async initLangMessages() {
      const value: LangMessages =  {} as LangMessages;
      try {
        const snapshot = await firebase.firestore().collection('langs')
        .where('active', '==', true).get();
        snapshot.docs.map(doc => {
            const data = doc.data() as LangMessage;
            value[data.id] = data;
        });
      } catch (err) {
        console.error('initLangMessages', err);
        throw new Error(err);
      }
      this.langsMessages = value;
    },
    async nextGuess(skip = false, found = false) {
      const game = useGameStore();
      if (game.pastGuess.length === this.guess.length) {
        game.pastGuess = [];
      }
      console.log('this.guesses', this.guesses);
      const result = randomSelect(
        filterListByTitle(this.guesses, game.pastGuess)
      );
      if (!skip) {
        game.pastGuess.push(result.title);
      }
      if (skip) {
        game.skipGuess.push(result.title);
      }
      if (found) {
        game.foundGuess.push(result.title);
      }
      this.guess = result.title;
    },
  }
})