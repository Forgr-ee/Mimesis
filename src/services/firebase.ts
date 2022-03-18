// import { IAPProductCustom, registerProduct, restore } from './iap'
import firebase from 'firebase/app'
// Required for side-effects
import 'firebase/firestore'
import 'firebase/auth'
import { isPlatform } from '@ionic/vue'
import { Package } from 'capacitor-purchases'
import { findPackage, isPurchased, restore } from './iap'

export interface Player {
  uuid: string
  score: number
  name: string
}

export interface Entity {
  uuid: string
}
export interface Team extends Entity {
  score: number
  name: string
  players: Player[]
  pastPlayers: string[]
}

export type Theme = {
  active: boolean
  lang: {
    [key: string]: string
  }
  package?: Package | null
  icon: string
  id_ios: string
  id_android: string
  id: string
  order: number
  status: 'paid' | 'free' | 'purchased'
}

export type GuessDb = {
  [key: string]: Guess[]
}

export interface Config {
  version: string
  versionPath: string
}

export type Guess = {
  title: string
  cover?: string
  author?: string
  type?: string
}

type Message = {
  [key: string]: string
}

export type LangMessage = Message & {
  id: string
  active: boolean
}

export type LangMessages = {
  [key: string]: LangMessage
}

type Usefirebase = {
  firebase: typeof firebase
  getGuessesDb: (themes: Theme[], lang: string) => Promise<GuessDb>
  getThemes: () => Promise<Theme[]>
  getLangMessages: () => Promise<LangMessages>
  getLastVersion: () => Promise<Config>
  addGame: (
    uid: string | undefined,
    lang: string,
    game: unknown
  ) => Promise<number>
  login: () => Promise<firebase.User | null>
  logout: () => Promise<null>
  getUser: () => Promise<firebase.User | null>
}

export const useFirebase = (): Usefirebase => {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(
      JSON.parse(import.meta.env.FIREBASE_CONFIG as string)
    )
  }
  const getUser = (): Promise<firebase.User | null> => {
    return new Promise<firebase.User | null>((resolve, reject) => {
      firebase.auth().onAuthStateChanged(resolve, reject)
    })
  }
  const login = async () => {
    await firebase.auth().signInAnonymously()
    return firebase.auth().currentUser
  }
  const logout = async (): Promise<null> => {
    await firebase.auth().signOut()
    return null
  }
  const getGuesses = async (category: string, lang: string) => {
    const value: Guess[] = []
    try {
      const snapshot = await firebase
        .firestore()
        .collection(`mode/${category}/${lang}`)
        .get()
      snapshot.docs.map((doc) => {
        const data = doc.data() as Guess
        value.push(data)
      })
    } catch (err) {
      console.error('initThemes', err)
      throw new Error(err as never)
    }
    return value
  }
  const getLastVersion = async (): Promise<Config> => {
    try {
      const config = (
        await firebase.firestore().collection(`config`).doc('app').get()
      ).data() as Config
      return config
    } catch (err) {
      console.error('getLastVersion', err)
      throw new Error(err as never)
    }
  }
  const getGuessesDb = async (
    themes: Theme[],
    lang: string
  ): Promise<GuessDb> => {
    const guessDb = {} as GuessDb
    try {
      for (let index = 0; index < themes.length; index++) {
        const theme = themes[index]
        const guessList = await getGuesses(theme.id, lang)
        guessDb[`${theme.id}_${lang}`] = guessList
      }
    } catch (err) {
      console.error('getGuessesDb', err)
      throw new Error(err as never)
    }
    return guessDb
  }
  const getThemes = async () => {
    let values: Theme[] = []
    try {
      const snapshot = await firebase
        .firestore()
        .collection('mode')
        .where('active', '==', true)
        .orderBy('order', 'asc')
        .get()
      const pList: Promise<Theme>[] = []
      const pInfo = isPlatform('capacitor') ? await restore() : null
      console.log('getThemes')
      snapshot.docs.map((doc) => {
        const theme = doc.data() as Theme
        if (isPlatform('capacitor')) {
          const productId = isPlatform('ios') ? theme.id_ios : theme.id_android
          pList.push(
            // Promise.resolve(theme)
            findPackage(productId).then((product) => {
              if (!product) return theme
              theme.package = product
              const owned = isPurchased(product.identifier, pInfo)
              if (product && owned) {
                theme.status = 'purchased'
              }
              return theme
            })
          )
        } else {
          pList.push(Promise.resolve(theme))
        }
      })
      values = await Promise.all(pList)
      console.log('getThemes', values)
    } catch (err) {
      console.error('initThemes', err)
      throw new Error(err as never)
    }
    return values
  }
  const getLangMessages = async (): Promise<LangMessages> => {
    const value: LangMessages = {} as LangMessages
    try {
      const snapshot = await firebase
        .firestore()
        .collection('langs')
        .where('active', '==', true)
        .get()
      snapshot.docs.map((doc) => {
        const data = doc.data() as LangMessage
        value[data.id] = data
      })
    } catch (err) {
      console.error('initLangMessages', err)
      throw new Error(err as never)
    }
    return value
  }
  const addGame = async (
    uid: string | undefined,
    lang: string,
    game: unknown
  ): Promise<number> => {
    if (!uid) return 0
    const refGames = firebase.firestore().collection(`users/${uid}/games`)
    const refUser = firebase.firestore().collection(`users`).doc(uid)
    await refGames.add({ lang, game, doneAt: new Date().toISOString() })
    const gamesRef = await refGames.get()
    const games = gamesRef.docs.length
    await refUser.set({
      games,
    })
    return games
  }
  return {
    firebase,
    getGuessesDb,
    getLastVersion,
    getThemes,
    getLangMessages,
    addGame,
    login,
    logout,
    getUser,
  }
}
