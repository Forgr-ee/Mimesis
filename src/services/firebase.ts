// import { IAPProductCustom, registerProduct, restore } from './iap'
import firebase from 'firebase/app'
// Required for side-effects
import 'firebase/firestore'
import 'firebase/auth'
import { isPlatform } from '@ionic/vue'
import { Package } from '@capgo/capacitor-purchases'
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

const getFakeGuesses = (category: string, lang: string) => {
  return [
    { title: `${lang}_${category}_1` },
    { title: `${lang}_${category}_2` },
    { title: `${lang}_${category}_3` },
  ] as Guess[]
}
const fakeConfig: Config = { version: '1.0.0', versionPath: 'test/test' }
const fakeThemes: Theme[] = [
  {
    active: true,
    lang: {},
    icon: 'data',
    id_ios: 't1.ios',
    id_android: 't1.android',
    id: 't1',
    order: 1,
    status: 'paid',
  },
]

export const useFirebase = (): Usefirebase => {
  if (firebase.apps.length === 0 && import.meta.env.FIREBASE_CONFIG) {
    firebase.initializeApp(
      JSON.parse(import.meta.env.FIREBASE_CONFIG as string)
    )
  }
  const getUser = (): Promise<firebase.User | null> => {
    return new Promise<firebase.User | null>((resolve, reject) => {
      if (!import.meta.env.FIREBASE_CONFIG) return resolve(null)
      firebase.auth().onAuthStateChanged(resolve, reject)
    })
  }
  const login = async () => {
    if (!import.meta.env.FIREBASE_CONFIG) return null
    await firebase.auth().signInAnonymously()
    return firebase.auth().currentUser
  }
  const logout = async (): Promise<null> => {
    if (!import.meta.env.FIREBASE_CONFIG) return Promise.resolve(null)
    await firebase.auth().signOut()
    return null
  }
  const getGuesses = async (category: string, lang: string) => {
    if (!import.meta.env.FIREBASE_CONFIG) return getFakeGuesses(category, lang)
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
    if (!import.meta.env.FIREBASE_CONFIG) return fakeConfig
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
    if (!import.meta.env.FIREBASE_CONFIG) return fakeThemes
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
      // console.log('getThemes', values)
    } catch (err) {
      console.error('initThemes', err)
      throw new Error(err as never)
    }
    return values
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
    addGame,
    login,
    logout,
    getUser,
  }
}
