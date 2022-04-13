import { randomSelect } from '../services/random'
import { defineStore } from 'pinia'

import {
  Guess,
  GuessDb,
  LangMessages,
  Theme,
  useFirebase,
} from '../services/firebase'
import { useGameStore } from './game'

const { getLangMessages, getThemes, getGuessesDb } = useFirebase()

const filterListByTitle = (list: Guess[], past: string[]) => {
  const filtered = list.filter((n) => !past.includes(n.title))
  return filtered
}
interface Version {
  updated: boolean
  version: string
  path: string
  folder: string
}

export const useMainStore = defineStore('main', {
  // other options...
  state: () => ({
    error: false,
    isActive: true,
    loading: false,
    lastVersion: {
      updated: true,
      version: '',
      path: '',
      folder: '',
    } as Version,
    versions: [] as Version[],
    lastUpdate: '',
    initialized: false,
    currentPath: '/home',
    themes: [] as Theme[],
    offline: false,
    langsMessages: {} as LangMessages,
    lang: 'fr',
    guessDb: {} as GuessDb,
    guess: { title: '' } as Guess,
  }),
  getters: {
    langs(): string[] {
      return Object.keys(this.langsMessages).map((key) => {
        const lang = this.langsMessages[key]
        return lang.id
      })
    },
    guesses(): Guess[] {
      const game = useGameStore()
      return this.guessDb[`${game.theme}_${this.lang}`]
    },
    needUpdate(): boolean {
      const lastUpdate = new Date(this.lastUpdate)
      const today = new Date()
      return (
        lastUpdate.getDate() !== today.getDate() ||
        lastUpdate.getMonth() !== today.getMonth() ||
        lastUpdate.getFullYear() !== today.getFullYear()
      )
    },
    nextGuesses(): Guess[] {
      const game = useGameStore()
      return filterListByTitle(this.guesses, game.pastGuess)
    },
  },
  actions: {
    async initialize(force = false) {
      console.log('initialize', force)
      this.offline = !window.navigator.onLine
      if (!force && (this.offline || this.initialized || !this.needUpdate))
        return
      this.loading = true
      try {
        await this.initLangMessages()
        this.initThemes().then(this.initGuessTheme)
        this.initialized = true
      } catch (err) {
        this.error = !!err
        console.log('err initialise', err)
      }
      this.lastUpdate = new Date().toISOString()
      this.loading = false
    },
    async initGuessTheme() {
      this.guessDb = await getGuessesDb(this.themes, this.lang)
    },
    async initThemes() {
      this.themes = await getThemes()
    },
    async initLangMessages() {
      this.langsMessages = await getLangMessages()
    },
    nextGuess(found = false) {
      const game = useGameStore()
      if (this.guess && this.guess.title !== '') {
        if (found) {
          game.foundGuess.push(this.guess.title)
        } else {
          game.skipGuess.push(this.guess.title)
        }
      }
      if (game.pastGuess.length === this.guesses.length) {
        game.skipGuess =
          game.skipGuess.length > 1
            ? [game.skipGuess[game.skipGuess.length - 1]]
            : []
      }
      const result = randomSelect<Guess>(this.nextGuesses)
      this.guess = result ? result : { title: 'Error' }
    },
  },
})
