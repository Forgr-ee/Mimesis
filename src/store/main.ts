import { randomSelect } from '@/services/random';
import { defineStore } from 'pinia'

import { collection, getFirestore, getDocs, orderBy, query, where } from "firebase/firestore"; 
import { firebaseApp } from '../services/firebase';
import { useGameStore } from './game';

const db = getFirestore(firebaseApp);

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

export type LangMessage = Message & {
  id: string;
  active: boolean;
}


export type LangMessages = {
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
      return this.guessDb[`${game.theme}_${this.lang}`];
    },
    needUpdate(): boolean {
      const lastUpdate = new Date(this.lastUpdate);
      const today = new Date();
      return lastUpdate.getDate() !== today.getDate() ||
        lastUpdate.getMonth() !== today.getMonth() ||
        lastUpdate.getFullYear() !== today.getFullYear()
    },
    nextGuesses(): Guess[] {
      const game = useGameStore();
      return filterListByTitle(this.guesses, game.pastGuess)
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
        const snapshot = await getDocs(collection(db, `mode/${category}/${this.lang}`));
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
        const snapshot = await getDocs(query(collection(db, 'mode'), where('active', '==', true), orderBy('order', 'asc')));
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
        const snapshot = await getDocs(query(collection(db, 'langs'), where('active', '==', true)));
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
    nextGuess(found = false) {
      const game = useGameStore();
      if (this.guess) {
        if (found) {
          game.foundGuess.push(this.guess);
        } else {
          game.skipGuess.push(this.guess);
        }   
      }
      if (game.pastGuess.length === this.guesses.length) {
        game.skipGuess = game.skipGuess.length > 1 ? [game.skipGuess[game.skipGuess.length - 1]] : [];
      }
      const result = randomSelect(this.nextGuesses)
      this.guess = result ? result.title : 'Error';
    },
  }
})